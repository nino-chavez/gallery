#!/usr/bin/env tsx
/**
 * Quality Metrics Analysis
 *
 * Critical question: What makes collection photos "the best"?
 * Are we using objective quality metrics or just narrative filters?
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

interface QualityMetrics {
	name: string;
	count: number;
	avgSharpness: number;
	avgComposition: number;
	avgImpact: number;
	avgExposure: number;
}

async function analyzeQuality() {
	console.log('🔍 Quality Metrics Analysis');
	console.log('Question: What makes collection photos "the best"?\n');
	console.log('═══════════════════════════════════════════════════════════\n');

	// 1. Comeback Stories
	const { data: comebackData } = await supabase
		.from('photo_metadata')
		.select('sharpness, composition_score, emotional_impact, exposure_accuracy')
		.eq('emotion', 'triumph')
		.eq('time_in_game', 'final_5_min')
		.gte('emotional_impact', 7)
		.not('sharpness', 'is', null);

	const comeback: QualityMetrics = {
		name: 'Comeback Stories',
		count: comebackData?.length || 0,
		avgSharpness: avg(comebackData, 'sharpness'),
		avgComposition: avg(comebackData, 'composition_score'),
		avgImpact: avg(comebackData, 'emotional_impact'),
		avgExposure: avg(comebackData, 'exposure_accuracy'),
	};

	// 2. Peak Intensity
	const { data: peakData } = await supabase
		.from('photo_metadata')
		.select('sharpness, composition_score, emotional_impact, exposure_accuracy')
		.eq('action_intensity', 'peak')
		.gte('emotional_impact', 8)
		.gte('sharpness', 7)
		.not('sharpness', 'is', null);

	const peak: QualityMetrics = {
		name: 'Peak Intensity',
		count: peakData?.length || 0,
		avgSharpness: avg(peakData, 'sharpness'),
		avgComposition: avg(peakData, 'composition_score'),
		avgImpact: avg(peakData, 'emotional_impact'),
		avgExposure: avg(peakData, 'exposure_accuracy'),
	};

	// 3. ALL enriched photos (baseline)
	const { data: allData } = await supabase
		.from('photo_metadata')
		.select('sharpness, composition_score, emotional_impact, exposure_accuracy')
		.not('sharpness', 'is', null);

	const baseline: QualityMetrics = {
		name: 'ALL ENRICHED (baseline)',
		count: allData?.length || 0,
		avgSharpness: avg(allData, 'sharpness'),
		avgComposition: avg(allData, 'composition_score'),
		avgImpact: avg(allData, 'emotional_impact'),
		avgExposure: avg(allData, 'exposure_accuracy'),
	};

	// 4. Top 1% by combined quality
	const { data: topData } = await supabase
		.from('photo_metadata')
		.select('sharpness, composition_score, emotional_impact, exposure_accuracy')
		.gte('sharpness', 9.5)
		.not('sharpness', 'is', null);

	const top1Percent: QualityMetrics = {
		name: 'Top 1% Sharpness (≥9.5)',
		count: topData?.length || 0,
		avgSharpness: avg(topData, 'sharpness'),
		avgComposition: avg(topData, 'composition_score'),
		avgImpact: avg(topData, 'emotional_impact'),
		avgExposure: avg(topData, 'exposure_accuracy'),
	};

	// Display results
	const metrics = [comeback, peak, baseline, top1Percent];

	console.log('Quality Comparison:\n');
	console.log('Collection                    | Count  | Sharp | Comp | Impact | Exposure');
	console.log('─────────────────────────────────────────────────────────────────────────');

	metrics.forEach(m => {
		console.log(
			`${m.name.padEnd(29)} | ${String(m.count).padStart(6)} | ` +
			`${m.avgSharpness.toFixed(1).padStart(5)} | ${m.avgComposition.toFixed(1).padStart(4)} | ` +
			`${m.avgImpact.toFixed(1).padStart(6)} | ${m.avgExposure.toFixed(1).padStart(8)}`
		);
	});

	console.log('\n');

	// Calculate deltas vs baseline
	console.log('Delta vs Baseline (ALL ENRICHED):\n');
	console.log('Collection                    | Sharp | Comp | Impact | Exposure');
	console.log('──────────────────────────────────────────────────────────────────');

	[comeback, peak, top1Percent].forEach(m => {
		const sharpDelta = m.avgSharpness - baseline.avgSharpness;
		const compDelta = m.avgComposition - baseline.avgComposition;
		const impactDelta = m.avgImpact - baseline.avgImpact;
		const exposureDelta = m.avgExposure - baseline.avgExposure;

		console.log(
			`${m.name.padEnd(29)} | ${formatDelta(sharpDelta)} | ${formatDelta(compDelta)} | ` +
			`${formatDelta(impactDelta)} | ${formatDelta(exposureDelta)}`
		);
	});

	// Distribution analysis
	console.log('\n\n═══════════════════════════════════════════════════════════');
	console.log('Quality Distribution Analysis\n');

	const { data: distData } = await supabase
		.from('photo_metadata')
		.select('sharpness, composition_score, emotional_impact')
		.not('sharpness', 'is', null);

	const excellent = {
		sharpness: distData?.filter(p => p.sharpness >= 9).length || 0,
		composition: distData?.filter(p => p.composition_score >= 9).length || 0,
		impact: distData?.filter(p => p.emotional_impact >= 9).length || 0,
		triple: distData?.filter(p =>
			p.sharpness >= 9 &&
			p.composition_score >= 9 &&
			p.emotional_impact >= 9
		).length || 0,
	};

	const total = distData?.length || 1;

	console.log(`Excellent Sharpness (≥9):     ${excellent.sharpness.toLocaleString().padStart(6)} (${(excellent.sharpness / total * 100).toFixed(1)}%)`);
	console.log(`Excellent Composition (≥9):   ${excellent.composition.toLocaleString().padStart(6)} (${(excellent.composition / total * 100).toFixed(1)}%)`);
	console.log(`Excellent Impact (≥9):        ${excellent.impact.toLocaleString().padStart(6)} (${(excellent.impact / total * 100).toFixed(1)}%)`);
	console.log(`Triple Excellent (all ≥9):    ${excellent.triple.toLocaleString().padStart(6)} (${(excellent.triple / total * 100).toFixed(1)}%)`);

	// Conclusion
	console.log('\n\n═══════════════════════════════════════════════════════════');
	console.log('CONCLUSION\n');

	const comebackBetter = comeback.avgSharpness > baseline.avgSharpness && comeback.avgImpact > baseline.avgImpact;
	const peakBetter = peak.avgSharpness > baseline.avgSharpness && peak.avgImpact > baseline.avgImpact;

	if (comebackBetter && peakBetter) {
		console.log('✅ Collections ARE objectively better than baseline:');
		console.log('   - Higher sharpness scores');
		console.log('   - Higher emotional impact');
		console.log('   - Narrative filters (emotion, time_in_game) select for quality\n');
	} else {
		console.log('⚠️  Collections use narrative filters, NOT quality filters:');
		console.log('   - Similar or lower quality scores vs baseline');
		console.log('   - "Best" is defined by story fit, not technical excellence');
		console.log('   - Consider adding quality thresholds to collection queries\n');
	}

	console.log('💡 Recommendation:');
	if (excellent.triple > 96) {
		console.log(`   ${excellent.triple} photos have triple-excellent scores (≥9/10 on all metrics).`);
		console.log(`   Consider a "Portfolio Excellence" collection showcasing only these.`);
	} else {
		console.log(`   Current curation balances narrative storytelling with quality.`);
		console.log(`   Narrative fit is prioritized over pure technical scores.`);
	}
}

function avg(data: any[] | null, field: string): number {
	if (!data || data.length === 0) return 0;
	const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
	return sum / data.length;
}

function formatDelta(delta: number): string {
	const sign = delta >= 0 ? '+' : '';
	return `${sign}${delta.toFixed(1)}`.padStart(6);
}

analyzeQuality().catch(console.error);
