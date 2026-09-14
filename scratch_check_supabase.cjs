const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: items, error } = await supabase
    .from('Item')
    .select('id, code, name, description, quantity, status, imageUrl, price, rentPercentage, maintenanceQuantity, rentedQuantity')
    .limit(5);

  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log('Successfully fetched', items.length, 'items from Supabase:');
    console.log(items);
  }

  const { count, error: countErr } = await supabase
    .from('Item')
    .select('*', { count: 'exact', head: true });
  console.log('Total items count via Supabase:', count, countErr);
}

run();

