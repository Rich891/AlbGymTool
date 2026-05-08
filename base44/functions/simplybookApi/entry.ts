import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPANY_LOGIN = Deno.env.get('SIMPLYBOOK_COMPANY_LOGIN');
const API_KEY = Deno.env.get('SIMPLYBOOK_API_KEY');
const LOGIN_URL = 'https://user-api.simplybook.it/login';
const API_URL = 'https://user-api.simplybook.it';

async function rpc(url, method, params = [], headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}

async function getToken() {
  return await rpc(LOGIN_URL, 'getToken', [COMPANY_LOGIN, API_KEY]);
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json();
  const { action, serviceId, date, unitId, time, clientData } = body;

  const token = await getToken();
  const headers = { 'X-Company-Login': COMPANY_LOGIN, 'X-Token': token };

  if (action === 'getSlots') {
    // Try both parameter orders that SimplyBook supports
    const slots = await rpc(API_URL, 'getStartTimeMatrix', [date, date, serviceId, unitId || null, 1], headers);
    return Response.json({ slots: slots[date] || [], raw: slots });
  }

  if (action === 'getNextSlot') {
    // Find next available date + time for a service
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 60);
    const fmt = (d) => d.toISOString().slice(0, 10);

    // Get work calendar for current month and next
    const schedule1 = await rpc(API_URL, 'getWorkCalendar', [today.getFullYear(), today.getMonth() + 1, serviceId], headers);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const schedule2 = await rpc(API_URL, 'getWorkCalendar', [nextMonth.getFullYear(), nextMonth.getMonth() + 1, serviceId], headers);
    const schedule = { ...schedule1, ...schedule2 };

    // Find first available day with actual slots
    const availableDays = Object.entries(schedule)
      .filter(([d, v]) => v.is_day_off === '0' && d >= fmt(today))
      .sort(([a], [b]) => a.localeCompare(b));

    for (const [day] of availableDays.slice(0, 14)) {
      const slotResult = await rpc(API_URL, 'getStartTimeMatrix', [day, day, serviceId, unitId || null, 1], headers);
      const daySlots = slotResult[day] || [];
      if (daySlots.length > 0) {
        return Response.json({ date: day, slots: daySlots });
      }
    }
    return Response.json({ date: null, slots: [] });
  }

  if (action === 'getWorkDays') {
    // Get days that have availability in the next 60 days
    const today = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 60);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const schedule = await rpc(API_URL, 'getWorkCalendar', [today.getFullYear(), today.getMonth() + 1, serviceId], headers);
    return Response.json({ schedule });
  }

  if (action === 'getUnits') {
    const units = await rpc(API_URL, 'getUnitList', [true, true], headers);
    return Response.json({ units });
  }

  if (action === 'book') {
    // clientData: { name, email, phone }
    const result = await rpc(API_URL, 'book', [
      serviceId,
      unitId || null,
      date,
      time,
      clientData,
      [],
      1
    ], headers);
    return Response.json({ booking: result });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});