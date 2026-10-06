// Vercel Serverless Function: POST /api/track
// Lấy IP thật từ header của Vercel rồi ghi vào bảng public.visits (Supabase) bằng service_role key.
// Cần 2 biến môi trường trên Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const EVENTS = new Set(['page_view', 'sim_open']);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (!EVENTS.has(b.event)) { res.status(400).end(); return; }

  const h = req.headers;
  const ip = ((h['x-forwarded-for'] || '').split(',')[0] || h['x-real-ip'] || '').trim() || 'unknown';

  const row = {
    ip,
    event: b.event,
    path: String(b.path || '').slice(0, 200),
    referrer: String(b.ref || '').slice(0, 300),
    session_id: String(b.sid || '').slice(0, 64),
    user_agent: String(h['user-agent'] || '').slice(0, 300),
    country: h['x-vercel-ip-country'] || null,
    city: h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : null,
  };

  try {
    const r = await fetch(process.env.SUPABASE_URL + '/rest/v1/visits', {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    res.status(r.ok ? 204 : 502).end();
  } catch (e) {
    res.status(500).end();
  }
};
