/**
 * Create Timeline Metadata View
 *
 * This script creates a database view that pre-computes timeline structure
 * for efficient page scaffolding without fetching thousands of photos.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTimelineView() {
  console.log('📊 Creating Timeline Metadata View\n');

  // Read SQL file
  const sqlPath = join(process.cwd(), 'database', 'timeline-metadata-view.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Extract just the view creation (skip comments and examples)
  const createViewSQL = sql
    .split('-- Example queries')[0]  // Take everything before examples
    .split('-- Create materialized view')[0]  // Take everything before materialized view section
    .trim();

  console.log('📝 Executing SQL...\n');

  // Execute using RPC if available, otherwise use raw SQL
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createViewSQL
    });

    if (error) {
      throw error;
    }

    console.log('✅ View created successfully!\n');
  } catch (rpcError) {
    console.log('⚠️  RPC method not available, trying alternative approach...\n');

    // Fallback: Try using Supabase REST API directly
    // Note: This requires proper permissions on the service role key
    console.error('❌ Cannot create view directly through Supabase JS client.');
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/[your-project]/sql\n');
    console.log(createViewSQL);
    console.log('\n');
    return;
  }

  // Test the view
  console.log('🧪 Testing view...\n');

  const { data: months, error: queryError } = await supabase
    .from('timeline_months')
    .select('year, month, photo_count, sport_counts, category_counts')
    .limit(10);

  if (queryError) {
    console.error('❌ Error querying view:', queryError);
    return;
  }

  console.log(`✅ Found ${months?.length} months in timeline:\n`);

  for (const month of months || []) {
    const sportSummary = month.sport_counts
      ? Object.entries(month.sport_counts)
          .map(([sport, count]) => `${sport}:${count}`)
          .join(', ')
      : 'none';

    console.log(`  ${month.year}-${String(month.month).padStart(2, '0')}: ${month.photo_count} photos (${sportSummary})`);
  }

  // Show summary
  const { data: summary } = await supabase
    .from('timeline_months')
    .select('year, photo_count');

  if (summary) {
    const yearTotals = new Map<number, number>();

    for (const row of summary) {
      yearTotals.set(row.year, (yearTotals.get(row.year) || 0) + row.photo_count);
    }

    console.log('\n📊 Total photos by year:');
    for (const [year, total] of Array.from(yearTotals.entries()).sort((a, b) => b[0] - a[0])) {
      console.log(`  ${year}: ${total.toLocaleString()} photos`);
    }
  }

  console.log('\n✅ Timeline view is ready to use!');
  console.log('\n📖 Next steps:');
  console.log('   1. Update timeline +page.server.ts to use this view');
  console.log('   2. Update scrubber component to use pre-computed counts');
  console.log('   3. Update filter dropdowns to use month metadata');
}

createTimelineView().catch(console.error);
