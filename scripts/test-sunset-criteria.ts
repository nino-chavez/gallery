#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function testSunsetCriteria() {
  const { count: total } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .not('sharpness', 'is', null);

  // Current: evening + composition≥7 + sharpness≥7 = 10,562 (53%)
  // Option 1: Add emotional_impact≥7
  const { count: opt1 } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('time_of_day', 'evening')
    .gte('composition_score', 7)
    .gte('sharpness', 7)
    .gte('emotional_impact', 7)
    .not('sharpness', 'is', null);
  
  // Option 2: Raise composition to ≥8 + emotional_impact≥7
  const { count: opt2 } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('time_of_day', 'evening')
    .gte('composition_score', 8)
    .gte('sharpness', 7)
    .gte('emotional_impact', 7)
    .not('sharpness', 'is', null);
  
  // Option 3: composition≥8 + emotional_impact≥8
  const { count: opt3 } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('time_of_day', 'evening')
    .gte('composition_score', 8)
    .gte('sharpness', 7)
    .gte('emotional_impact', 8)
    .not('sharpness', 'is', null);
  
  console.log('Sunset Sessions Narrowing Options:');
  console.log(`Total enriched: ${total?.toLocaleString()}`);
  console.log(`Current: evening + comp≥7 + sharp≥7 = 10,562 (53%)`);
  console.log(`Option 1: + emotional≥7 = ${opt1?.toLocaleString()} (${((opt1||0)/(total||1)*100).toFixed(2)}%)`);
  console.log(`Option 2: comp≥8 + emotional≥7 = ${opt2?.toLocaleString()} (${((opt2||0)/(total||1)*100).toFixed(2)}%)`);
  console.log(`Option 3: comp≥8 + emotional≥8 = ${opt3?.toLocaleString()} (${((opt3||0)/(total||1)*100).toFixed(2)}%)`);
  
  // Try very high composition threshold
  const { count: opt7 } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('time_of_day', 'evening')
    .gte('composition_score', 9)
    .gte('sharpness', 7)
    .gte('emotional_impact', 7)
    .not('sharpness', 'is', null);
  
  // Try combining with action_intensity
  const { count: opt9 } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('time_of_day', 'evening')
    .in('action_intensity', ['high', 'peak'])
    .gte('composition_score', 8)
    .gte('sharpness', 7)
    .gte('emotional_impact', 7)
    .not('sharpness', 'is', null);
  
  console.log(`\nHigher thresholds:`);
  console.log(`Option 7: comp≥9 + sharp≥7 + emotional≥7 = ${opt7?.toLocaleString()} (${((opt7||0)/(total||1)*100).toFixed(2)}%)`);
  console.log(`Option 9: evening + high/peak action + comp≥8 = ${opt9?.toLocaleString()} (${((opt9||0)/(total||1)*100).toFixed(2)}%)`);
}

testSunsetCriteria().catch(console.error);

