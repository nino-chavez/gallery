import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkStatus() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 24);

  // Total photos in last 24 months
  const { count: total } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .gte('photo_date', cutoffDate.toISOString());

  // Photos with new metadata
  const { count: enriched } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .gte('photo_date', cutoffDate.toISOString())
    .not('lighting', 'is', null);

  // Photos still needing enrichment
  const { count: remaining } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .gte('photo_date', cutoffDate.toISOString())
    .is('lighting', null);

  console.log('\n📊 Backfill Status (Last 24 Months)\n');
  console.log('════════════════════════════════════════');
  console.log(`Total photos:       ${total}`);
  console.log(`Enriched:           ${enriched} (${((enriched! / total!) * 100).toFixed(1)}%)`);
  console.log(`Remaining:          ${remaining}`);
  console.log(`Actual cost so far: $${(enriched! * 0.000128).toFixed(2)}`);
  console.log(`Est. remaining:     $${(remaining! * 0.000128).toFixed(2)}`);
  console.log('════════════════════════════════════════\n');

  process.exit(0);
}

checkStatus();
