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
    // Get available slots for a given service and date
    const slots = await rpc(API_URL, 'getStartTimeMatrix', [date, date, serviceId, unitId || null, 1], headers);
    const daySlots = slots[date] || [];
    return Response.json({ slots: daySlots });
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