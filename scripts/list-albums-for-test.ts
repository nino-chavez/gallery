#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n📊 Albums needing enrichment (sorted by count):\n');

  // Get all albums with photo counts
  const { data: photos, error } = await supabase
    .from('photo_metadata')
    .select('album_key, album_name, photo_date')
    .is('lighting', null);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log('No photos need enrichment!');
    process.exit(0);
  }

  // Group by album
  const albumCounts = new Map<string, { name: string; count: number; latestDate: string }>();

  for (const photo of photos) {
    const existing = albumCounts.get(photo.album_key);
    if (!existing) {
      albumCounts.set(photo.album_key, {
        name: photo.album_name,
        count: 1,
        latestDate: photo.photo_date
      });
    } else {
      existing.count++;
      if (photo.photo_date > existing.latestDate) {
        existing.latestDate = photo.photo_date;
      }
    }
  }

  // Sort by count descending
  const sorted = Array.from(albumCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15); // Top 15 albums

  // Display table
  console.log('Album Key    | Count | Latest Date | Album Name');
  console.log('-------------|-------|-------------|' + '-'.repeat(50));

  for (const [key, data] of sorted) {
    const keyPad = key.padEnd(12);
    const countPad = data.count.toString().padStart(5);
    const datePad = data.latestDate.split('T')[0];
    const name = data.name.substring(0, 50);
    console.log(`${keyPad} | ${countPad} | ${datePad} | ${name}`);
  }

  // Find albums with ~200 photos
  const candidates = sorted.filter(([_, data]) => data.count >= 150 && data.count <= 300);

  if (candidates.length > 0) {
    console.log(`\n🎯 Recommended test albums (~200 photos):\n`);
    for (const [key, data] of candidates.slice(0, 3)) {
      console.log(`   ALBUM_KEY="${key}" npx tsx scripts/backfill-schema-v2-metadata.ts`);
      console.log(`   # ${data.name} (${data.count} photos)\n`);
    }
  } else {
    console.log(`\n💡 No albums with ~200 photos. Largest album: ${sorted[0][1].count} photos`);
    console.log(`   ALBUM_KEY="${sorted[0][0]}" npx tsx scripts/backfill-schema-v2-metadata.ts\n`);
  }

  console.log(`\nTotal photos needing enrichment: ${photos.length}\n`);
}

main().catch(console.error);
