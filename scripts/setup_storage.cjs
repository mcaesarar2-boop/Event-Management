const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '', dbUrl = '';
env.split('\n').forEach((l) => {
  const line = l.trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    key = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].replace(/^["']|["']$/g, '').trim();
  }
});

const supabase = createClient(url, key);

async function run() {
  console.log('1. Connecting to PostgreSQL to add logo_url column...');
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await pgClient.connect();

  await pgClient.query(`
    ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS logo_url TEXT;
  `);
  console.log('   -> Column logo_url ensured in public.sponsorships!');

  // Check storage bucket
  console.log('2. Checking Supabase storage bucket: sponsorship-logos...');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error('   Error listing buckets:', bErr);
  } else {
    console.log('   Existing buckets:', buckets.map(b => b.name));
  }

  const exists = buckets && buckets.some(b => b.name === 'sponsorship-logos');
  if (!exists) {
    console.log('   Creating public bucket "sponsorship-logos"...');
    // We can create via SQL or storage API:
    // With SQL in storage.buckets:
    try {
      await pgClient.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('sponsorship-logos', 'sponsorship-logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'])
        ON CONFLICT (id) DO UPDATE SET public = true;

        -- Allow public read policy
        DROP POLICY IF EXISTS "Public Access" ON storage.objects;
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'sponsorship-logos');

        -- Allow anon/auth insert policy
        DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
        CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sponsorship-logos');

        -- Allow anon/auth update policy
        DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
        CREATE POLICY "Allow Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'sponsorship-logos');

        -- Allow anon/auth delete policy
        DROP POLICY IF EXISTS "Allow Deletes" ON storage.objects;
        CREATE POLICY "Allow Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'sponsorship-logos');
      `);
      console.log('   -> Successfully created bucket "sponsorship-logos" and public RLS policies via Postgres!');
    } catch (sqlErr) {
      console.error('   SQL bucket creation error:', sqlErr.message);
    }
  } else {
    console.log('   Bucket "sponsorship-logos" already exists!');
  }

  await pgClient.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

