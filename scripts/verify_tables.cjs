const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
env.split('\n').forEach((l) => {
  const line = l.trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    key = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
});

const supabase = createClient(url, key);

async function check() {
  const tables = [
    'clients', 'venues', 'vendors', 'events', 'sponsorships',
    'artists', 'tasks', 'budget_items', 'purchase_orders',
    'revenues', 'crew_assignments', 'rundown_items',
    'risk_items', 'document_items', 'payment_records'
  ];

  console.log('Verifying PostgREST access for all 15 tables...');
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`ERROR on table ${t}:`, error.message);
    } else {
      console.log(`Table '${t}' is LIVE! Record count: ${count}`);
    }
  }
}

check();

