import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPANY_LOGIN = Deno.env.get('SIMPLYBOOK_COMPANY_LOGIN');
const API_KEY = Deno.env.get('SIMPLYBOOK_API_KEY');
const LOGIN_URL = 'https://user-api.simplybook.it/login/';
const API_URL = 'https://user-api.simplybook.it/';

async function rpc(url, method, params = [], headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON from SimplyBook: ' + text.slice(0, 200)); }
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function getToken() {
  return await rpc(LOGIN_URL, 'getToken', [COMPANY_LOGIN, API_KEY]);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, serviceId, date, unitId, time, clientData } = body;

    const token = await getToken();
    const headers = { 'X-Company-Login': COMPANY_LOGIN, 'X-Token': token };

    if (action === 'getWorkDays') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const schedule = await rpc(API_URL, 'getWorkCalendar', [year, month, serviceId], headers);
      return Response.json({ schedule });
    }

    if (action === 'getSlots') {
      const slots = await rpc(API_URL, 'getStartTimeMatrix', [date, date, serviceId, unitId || null, 1], headers);
      const daySlots = (slots && slots[date]) ? slots[date] : [];
      return Response.json({ slots: daySlots });
    }

    if (action === 'book') {
      const result = await rpc(API_URL, 'book', [
        serviceId,
        unitId || null,
        date,
        time,
        clientData,
        [],
        1,
      ], headers);
      return Response.json({ booking: result });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});