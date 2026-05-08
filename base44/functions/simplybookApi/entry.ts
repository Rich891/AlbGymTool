const COMPANY_LOGIN = Deno.env.get('SIMPLYBOOK_COMPANY_LOGIN');
const API_KEY = Deno.env.get('SIMPLYBOOK_API_KEY');

const LOGIN_URL = 'https://user-api.simplybook.me/login';
const API_URL = 'https://user-api.simplybook.me';

async function rpc(url, method, params = [], headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const text = await res.text();
  console.log(`[RPC] ${method} -> ${text.slice(0, 400)}`);
  const data = JSON.parse(text);
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function getToken() {
  console.log('[AUTH] company:', COMPANY_LOGIN, '| key:', API_KEY?.slice(0, 8) + '...');
  return await rpc(LOGIN_URL, 'getToken', [COMPANY_LOGIN, API_KEY]);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, serviceId, date, unitId, time, clientData } = body;

    const token = await getToken();
    const headers = { 'X-Company-Login': COMPANY_LOGIN, 'X-Token': token };

    if (action === 'getServices') {
      const result = await rpc(API_URL, 'getEventList', [], headers);
      return Response.json({ services: result });
    }

    if (action === 'getWorkDays') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const result = await rpc(API_URL, 'getWorkCalendar', [year, month, unitId || null], headers);
      return Response.json({ schedule: result });
    }

    if (action === 'getSlots') {
      const result = await rpc(API_URL, 'getStartTimeMatrix', [date, date, serviceId, unitId || null, 1], headers);
      const slots = (result && result[date]) ? result[date] : [];
      return Response.json({ slots });
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
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});