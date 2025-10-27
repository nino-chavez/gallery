/**
 * Find Most Recent Album for Testing
 *
 * Quick utility to identify the most recent album for isolated backfill testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findRecentAlbum() {
  console.log('Finding most recent album...\n');

  // Get albums with photo counts, ordered by most recent upload
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('album_key, album_name, upload_date')
    .not('album_key', 'is', null)
    .not('album_name', 'is', null)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    process.exit(1);
  }

  // Group by album and count
  const albumCounts = new Map<string, { name: string; count: number; latest: string }>();

  for (const row of data || []) {
    const key = row.album_key;
    if (!albumCounts.has(key)) {
      albumCounts.set(key, {
        name: row.album_name,
        count: 0,
        latest: row.upload_date
      });
    }
    albumCounts.get(key)!.count++;
  }

  // Sort by latest upload date
  const albums = Array.from(albumCounts.entries())
    .map(([key, info]) => ({ key, ...info }))
    .sort((a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime())
    .slice(0, 10);

  console.log('Top 10 Most Recent Albums:\n');
  albums.forEach((album, i) => {
    console.log(`${i + 1}. ${album.name}`);
    console.log(`   Album Key: ${album.key}`);
    console.log(`   Photos: ${album.count}`);
    console.log(`   Latest Upload: ${new Date(album.latest).toLocaleDateString()}`);
    console.log('');
  });

  // Check which albums need backfilling
  console.log('\nChecking albums needing backfill (missing lighting data)...\n');

  for (const album of albums.slice(0, 3)) {
    const { count } = await supabase
      .from('photo_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('album_key', album.key)
      .is('lighting', null);

    console.log(`${album.name}: ${count || 0} photos need backfill (out of ${album.count})`);
  }

  console.log(`\nTo run isolated test on most recent album:`);
  console.log(`ALBUM_KEY="${albums[0].key}" npm run backfill:schema-v2\n`);
}

findRecentAlbum()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
