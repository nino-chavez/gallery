#!/usr/bin/env tsx
/**
 * Comprehensive Collection Coverage Analysis
 *
 * Analyzes all 10 collections to see actual photo counts and coverage
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

interface CollectionAnalysis {
	slug: string;
	title: string;
	count: number;
	coverage: number;
	status: 'good' | 'ok' | 'low' | 'empty';
}

async function analyzeAllCollections() {
	console.log('📊 Comprehensive Collection Coverage Analysis\n');
	console.log('═══════════════════════════════════════════════════════════\n');

	// Total enriched photos
	const { count: totalEnriched } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.not('sharpness', 'is', null);

	console.log(`Total Enriched Photos: ${totalEnriched?.toLocaleString() || 0}\n`);

	const collections: CollectionAnalysis[] = [];

	// 1. Portfolio Excellence
	const { count: portfolioCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.gte('sharpness', 9)
		.gte('composition_score', 9)
		.gte('emotional_impact', 9)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'portfolio-excellence',
		title: 'Portfolio Excellence',
		count: portfolioCount || 0,
		coverage: ((portfolioCount || 0) / (totalEnriched || 1)) * 100,
		status: (portfolioCount || 0) >= 50 ? 'good' : (portfolioCount || 0) >= 20 ? 'ok' : (portfolioCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 2. Comeback Stories
	const { count: comebackCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('emotion', 'triumph')
		.eq('time_in_game', 'final_5_min')
		.gte('emotional_impact', 7)
		.gte('sharpness', 7)
		.gte('composition_score', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'comeback-stories',
		title: 'Comeback Stories',
		count: comebackCount || 0,
		coverage: ((comebackCount || 0) / (totalEnriched || 1)) * 100,
		status: (comebackCount || 0) >= 50 ? 'good' : (comebackCount || 0) >= 20 ? 'ok' : (comebackCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 3. Peak Intensity
	const { count: peakCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('action_intensity', 'peak')
		.gte('emotional_impact', 8)
		.gte('sharpness', 7)
		.gte('composition_score', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'peak-intensity',
		title: 'Peak Intensity',
		count: peakCount || 0,
		coverage: ((peakCount || 0) / (totalEnriched || 1)) * 100,
		status: (peakCount || 0) >= 50 ? 'good' : (peakCount || 0) >= 20 ? 'ok' : (peakCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 4. Golden Hour Magic
	const { count: goldenHourCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('time_of_day', 'golden_hour')
		.gte('composition_score', 7)
		.gte('sharpness', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'golden-hour-magic',
		title: 'Golden Hour Magic',
		count: goldenHourCount || 0,
		coverage: ((goldenHourCount || 0) / (totalEnriched || 1)) * 100,
		status: (goldenHourCount || 0) >= 50 ? 'good' : (goldenHourCount || 0) >= 20 ? 'ok' : (goldenHourCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 5. Focus & Determination
	const { count: focusCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('emotion', 'determination')
		.gte('sharpness', 8)
		.gte('composition_score', 7)
		.gte('emotional_impact', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'focus-and-determination',
		title: 'Focus & Determination',
		count: focusCount || 0,
		coverage: ((focusCount || 0) / (totalEnriched || 1)) * 100,
		status: (focusCount || 0) >= 50 ? 'good' : (focusCount || 0) >= 20 ? 'ok' : (focusCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 6. Victory Celebrations
	const { count: celebrationCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('photo_category', 'celebration')
		.gte('emotional_impact', 7)
		.gte('sharpness', 7)
		.gte('composition_score', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'victory-celebrations',
		title: 'Victory Celebrations',
		count: celebrationCount || 0,
		coverage: ((celebrationCount || 0) / (totalEnriched || 1)) * 100,
		status: (celebrationCount || 0) >= 50 ? 'good' : (celebrationCount || 0) >= 20 ? 'ok' : (celebrationCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 7. Aerial Artistry
	const { count: aerialCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.in('play_type', ['attack', 'block'])
		.gte('sharpness', 8)
		.gte('composition_score', 8)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'aerial-artistry',
		title: 'Aerial Artistry',
		count: aerialCount || 0,
		coverage: ((aerialCount || 0) / (totalEnriched || 1)) * 100,
		status: (aerialCount || 0) >= 50 ? 'good' : (aerialCount || 0) >= 20 ? 'ok' : (aerialCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 8. Early Game Energy
	const { count: earlyGameCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('time_in_game', 'first_10_min')
		.gte('sharpness', 7)
		.gte('emotional_impact', 7)
		.gte('composition_score', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'early-game-energy',
		title: 'Early Game Energy',
		count: earlyGameCount || 0,
		coverage: ((earlyGameCount || 0) / (totalEnriched || 1)) * 100,
		status: (earlyGameCount || 0) >= 50 ? 'good' : (earlyGameCount || 0) >= 20 ? 'ok' : (earlyGameCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 9. Defensive Masterclass
	const { count: defensiveCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.in('play_type', ['dig', 'block'])
		.gte('sharpness', 7)
		.gte('emotional_impact', 7)
		.gte('composition_score', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'defensive-masterclass',
		title: 'Defensive Masterclass',
		count: defensiveCount || 0,
		coverage: ((defensiveCount || 0) / (totalEnriched || 1)) * 100,
		status: (defensiveCount || 0) >= 50 ? 'good' : (defensiveCount || 0) >= 20 ? 'ok' : (defensiveCount || 0) >= 10 ? 'low' : 'empty'
	});

	// 10. Sunset Sessions
	const { count: sunsetCount } = await supabase
		.from('photo_metadata')
		.select('photo_id', { count: 'exact', head: true })
		.eq('time_of_day', 'evening')
		.gte('composition_score', 7)
		.gte('sharpness', 7)
		.not('sharpness', 'is', null);
	collections.push({
		slug: 'sunset-sessions',
		title: 'Sunset Sessions',
		count: sunsetCount || 0,
		coverage: ((sunsetCount || 0) / (totalEnriched || 1)) * 100,
		status: (sunsetCount || 0) >= 50 ? 'good' : (sunsetCount || 0) >= 20 ? 'ok' : (sunsetCount || 0) >= 10 ? 'low' : 'empty'
	});

	// Display results
	console.log('Collection Coverage Summary:\n');
	console.log('Status Legend: ✅ Good (50+) | ⚠️ OK (20-49) | 🔴 Low (10-19) | ❌ Empty (<10)\n');
	
	collections.forEach((c, i) => {
		const statusIcon = c.status === 'good' ? '✅' : c.status === 'ok' ? '⚠️' : c.status === 'low' ? '🔴' : '❌';
		console.log(`${i + 1}. ${statusIcon} ${c.title}`);
		console.log(`   Photos: ${c.count.toLocaleString()} (${c.coverage.toFixed(2)}% of enriched)`);
		console.log(`   Status: ${c.status.toUpperCase()}\n`);
	});

	// Summary statistics
	const goodCollections = collections.filter(c => c.status === 'good').length;
	const okCollections = collections.filter(c => c.status === 'ok').length;
	const lowCollections = collections.filter(c => c.status === 'low').length;
	const emptyCollections = collections.filter(c => c.status === 'empty').length;
	const totalMatching = collections.reduce((sum, c) => sum + c.count, 0);

	console.log('═══════════════════════════════════════════════════════════');
	console.log('SUMMARY');
	console.log('═══════════════════════════════════════════════════════════');
	console.log(`✅ Good coverage (50+ photos): ${goodCollections}`);
	console.log(`⚠️  OK coverage (20-49 photos): ${okCollections}`);
	console.log(`🔴 Low coverage (10-19 photos): ${lowCollections}`);
	console.log(`❌ Empty/poor coverage (<10 photos): ${emptyCollections}`);
	console.log(`\nTotal photos matching collection criteria: ${totalMatching.toLocaleString()}`);
	console.log(`Average photos per collection: ${Math.round(totalMatching / collections.length)}`);
	console.log(`\n💡 Recommendations:`);
	
	if (emptyCollections > 0) {
		console.log(`   - ${emptyCollections} collection(s) have <10 photos - consider removing or broadening criteria`);
	}
	if (lowCollections > 0) {
		console.log(`   - ${lowCollections} collection(s) have 10-19 photos - consider broadening criteria`);
	}
	
	// Check for overlaps
	console.log(`\n📊 Overlap Analysis:`);
	const goldenHour = collections.find(c => c.slug === 'golden-hour-magic')?.count || 0;
	const sunset = collections.find(c => c.slug === 'sunset-sessions')?.count || 0;
	console.log(`   Golden Hour (${goldenHour}) + Sunset Sessions (${sunset}) = Potential merge`);
	
	const aerial = collections.find(c => c.slug === 'aerial-artistry')?.count || 0;
	const defensive = collections.find(c => c.slug === 'defensive-masterclass')?.count || 0;
	console.log(`   Aerial Artistry (${aerial}) + Defensive Masterclass (${defensive}) = Some overlap (both volleyball-focused)`);
}

analyzeAllCollections().catch(console.error);

