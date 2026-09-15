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

async function testUpload() {
  const testBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="indigo"/><text x="50" y="55" font-size="20" fill="white" text-anchor="middle">EMS</text></svg>');
  const filePath = `logos/${Date.now()}_test_brand.svg`;

  console.log('Testing upload to sponsorship-logos bucket at', filePath);
  const { data, error } = await supabase.storage.from('sponsorship-logos').upload(filePath, testBuffer, {
    contentType: 'image/svg+xml',
    upsert: true,
  });

  if (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }

  console.log('Upload success:', data);
  const { data: urlData } = supabase.storage.from('sponsorship-logos').getPublicUrl(filePath);
  console.log('Public URL:', urlData.publicUrl);

  // Clean up test file
  await supabase.storage.from('sponsorship-logos').remove([filePath]);
  console.log('Cleaned up test file.');
}

testUpload();

