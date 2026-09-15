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

async function testCRUD() {
  console.log('=== TESTING SUPABASE CRUD INTEGRATION ===');

  // 1. Test Client CRUD
  const testClientId = 'cli-test-' + Date.now();
  console.log('1. Inserting test client:', testClientId);
  const { error: insCliErr } = await supabase.from('clients').insert({
    id: testClientId,
    company: 'PT Global Testing Event',
    contact_person: 'Auditor Supabase',
    email: 'test@globaltesting.id',
    phone: '+6281299990000',
    industry: 'Enterprise Technology',
  });
  if (insCliErr) throw insCliErr;
  console.log('   -> Insert Client SUCCESS!');

  // Query it back
  const { data: qCli, error: qCliErr } = await supabase.from('clients').select('*').eq('id', testClientId).single();
  if (qCliErr || !qCli) throw qCliErr || new Error('Client not found');
  console.log('   -> Read Client SUCCESS! Company:', qCli.company);

  // Update it
  const { error: updCliErr } = await supabase.from('clients').update({ notes: 'Updated notes via test' }).eq('id', testClientId);
  if (updCliErr) throw updCliErr;
  console.log('   -> Update Client SUCCESS!');

  // Delete it
  const { error: delCliErr } = await supabase.from('clients').delete().eq('id', testClientId);
  if (delCliErr) throw delCliErr;
  console.log('   -> Delete Client SUCCESS!');

  // 2. Test Venue CRUD
  const testVenueId = 'ven-test-' + Date.now();
  console.log('2. Inserting test venue:', testVenueId);
  const { error: insVenErr } = await supabase.from('venues').insert({
    id: testVenueId,
    name: 'Testing Convention Hall',
    address: 'Jl. Uji Coba No. 123',
    city: 'Jakarta Selatan',
    capacity: 15000,
    type: 'Indoor',
  });
  if (insVenErr) throw insVenErr;
  console.log('   -> Insert Venue SUCCESS!');

  const { error: delVenErr } = await supabase.from('venues').delete().eq('id', testVenueId);
  if (delVenErr) throw delVenErr;
  console.log('   -> Delete Venue SUCCESS!');

  console.log('=== ALL CRUD TESTS PASSED SUCCESSFULLY! ===');
}

testCRUD().catch((err) => {
  console.error('CRUD test failed:', err);
  process.exit(1);
});

