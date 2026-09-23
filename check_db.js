const fs = require('fs');
const envStr = fs.readFileSync('d:/aicte-idea-labv6.1.2/.env', 'utf-8');
const SUPABASE_URL = envStr.match(/SUPABASE_URL=\"(.*?)\"/)[1];
const SUPABASE_KEY = envStr.match(/SUPABASE_SERVICE_ROLE_KEY=\"(.*?)\"/)[1];

async function checkDb() {
try {
  const getHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };

  const res1 = await fetch(`${SUPABASE_URL}/rest/v1/event_registrations?select=*`, { headers: getHeaders });
  const data1 = await res1.text();
  console.log("EVENT REGISTRATIONS:", data1);

  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/slot_bookings?select=*`, { headers: getHeaders });
  const data2 = await res2.text();
  console.log("SLOT BOOKINGS:", data2);
} catch (e) { console.error(e); }
}

checkDb().catch(console.error);
