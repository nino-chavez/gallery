#!/usr/bin/env tsx
/**
 * Analyze Collection Coverage
 *
 * Shows how many enriched photos match each collection's criteria
 * to understand the true coverage vs the 24-photo limit
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeCollections() {
	console.log('📊 Collection Coverage Analysis\n');
	console.log('═══════════════════════════════════════════════════════════\n');

	// Total enriched photos
	const { count: totalEnriched } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.not('sharpness', 'is', null);

	console.log(`Total Enriched Photos: ${totalEnriched?.toLocaleString() || 0}\n`);

	// Collection 1: Comeback Stories
	const { count: comebackCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('emotion', 'triumph')
		.eq('time_in_game', 'final_5_min')
		.gte('emotional_impact', 7)
		.not('sharpness', 'is', null);

	console.log(`1. Comeback Stories (emotion='triumph' + time_in_game='final_5_min' + emotional_impact>=7):`);
	console.log(`   Matching photos: ${comebackCount || 0}`);
	console.log(`   Coverage: ${((comebackCount || 0) / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`   Displayed in collection: 24 (limit)`);
	console.log(`   Unutilized: ${Math.max(0, (comebackCount || 0) - 24)}\n`);

	// Collection 2: Peak Intensity
	const { count: peakCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('action_intensity', 'peak')
		.gte('emotional_impact', 8)
		.gte('sharpness', 7)
		.not('sharpness', 'is', null);

	console.log(`2. Peak Intensity (action_intensity='peak' + emotional_impact>=8 + sharpness>=7):`);
	console.log(`   Matching photos: ${peakCount || 0}`);
	console.log(`   Coverage: ${((peakCount || 0) / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`   Displayed in collection: 24 (limit)`);
	console.log(`   Unutilized: ${Math.max(0, (peakCount || 0) - 24)}\n`);

	// Collection 3: Golden Hour Magic
	const { count: goldenHourCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('time_of_day', 'golden_hour')
		.gte('composition_score', 7)
		.gte('sharpness', 7)
		.not('sharpness', 'is', null);

	console.log(`3. Golden Hour Magic (time_of_day='golden_hour' + composition_score>=7 + sharpness>=7):`);
	console.log(`   Matching photos: ${goldenHourCount || 0}`);
	console.log(`   Coverage: ${((goldenHourCount || 0) / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`   Displayed in collection: ${Math.min(goldenHourCount || 0, 24)}`);
	console.log(`   Unutilized: ${Math.max(0, (goldenHourCount || 0) - 24)}\n`);

	// Collection 4: Focus & Determination
	const { count: focusCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('emotion', 'determination')
		.gte('sharpness', 8)
		.gte('composition_score', 6)
		.not('sharpness', 'is', null);

	console.log(`4. Focus & Determination (emotion='determination' + sharpness>=8 + composition_score>=6):`);
	console.log(`   Matching photos: ${focusCount || 0}`);
	console.log(`   Coverage: ${((focusCount || 0) / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`   Displayed in collection: 24 (limit)`);
	console.log(`   Unutilized: ${Math.max(0, (focusCount || 0) - 24)}\n`);

	// Collection 5: Victory Celebrations
	const { count: celebrationCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('photo_category', 'celebration')
		.gte('emotional_impact', 7)
		.not('sharpness', 'is', null);

	console.log(`5. Victory Celebrations (photo_category='celebration' + emotional_impact>=7):`);
	console.log(`   Matching photos: ${celebrationCount || 0}`);
	console.log(`   Coverage: ${((celebrationCount || 0) / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`   Displayed in collection: 24 (limit)`);
	console.log(`   Unutilized: ${Math.max(0, (celebrationCount || 0) - 24)}\n`);

	// Summary
	const totalMatching = (comebackCount || 0) + (peakCount || 0) + (goldenHourCount || 0) + (focusCount || 0) + (celebrationCount || 0);
	const totalDisplayed = 96; // 4 collections × 24 photos
	const totalUnutilized = totalMatching - totalDisplayed;

	console.log('═══════════════════════════════════════════════════════════');
	console.log('SUMMARY');
	console.log('═══════════════════════════════════════════════════════════');
	console.log(`Total photos matching collection criteria: ${totalMatching.toLocaleString()}`);
	console.log(`Total photos displayed (4 × 24): ${totalDisplayed}`);
	console.log(`Total unutilized: ${totalUnutilized.toLocaleString()}`);
	console.log(`Coverage of enriched photos: ${(totalMatching / (totalEnriched || 1) * 100).toFixed(2)}%`);
	console.log(`\n💡 Note: Collections are limited to 24 photos each for UI performance.`);
	console.log(`   The remaining ${totalUnutilized.toLocaleString()} matching photos could be used for:`);
	console.log(`   - Pagination within collections`);
	console.log(`   - Randomized rotation to keep content fresh`);
	console.log(`   - User-specific personalization`);
}

analyzeCollections().catch(console.error);
