const COMPANY_LOGIN = Deno.env.get('SIMPLYBOOK_COMPANY_LOGIN');
const API_USER_KEY = Deno.env.get('SIMPLYBOOK_API_USER_KEY');
const BASE_URL = `https://user-api-v2.simplybook.it/admin`;

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Company-Login': COMPANY_LOGIN,
      'X-Token': API_USER_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  console.log(`[API] status: ${res.status}, body: ${text.slice(0, 300)}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { action, serviceId, date, unitId, time, clientData } = body;

    if (action === 'getWorkDays') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const data = await apiFetch(`/schedule?service_id=${serviceId}&year=${year}&month=${month}`);
      return Response.json({ schedule: data });
    }

    if (action === 'getSlots') {
      const data = await apiFetch(`/schedule/available-slots?service_id=${serviceId}&date=${date}&count=1`);
      return Response.json({ slots: data });
    }

    if (action === 'book') {
      const data = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          service_id: serviceId,
          unit_id: unitId || null,
          start_datetime: `${date} ${time}`,
          client: clientData,
          count: 1,
        }),
      });
      return Response.json({ booking: data });
    }

    if (action === 'getServices') {
      const data = await apiFetch('/services');
      return Response.json({ services: data });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});