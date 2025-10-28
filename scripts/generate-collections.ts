#!/usr/bin/env tsx
/**
 * Collections Curation Engine
 *
 * Generates AI-curated story collections using Bucket 2 metadata.
 * Week 6 deliverable: AI curation engine for story-based photo collections.
 *
 * Collections use Bucket 2 (internal/AI) metadata for intelligent curation:
 * - emotion (joy, triumph, determination, focus, intensity, excitement)
 * - action_intensity (low, medium, high, peak)
 * - time_in_game (warm_up, opening, mid_game, final_5_min, overtime)
 * - emotional_impact (1-10 scale)
 * - time_of_day (morning, afternoon, evening, golden_hour, night)
 * - composition_score (1-10 scale)
 * - sharpness (1-10 scale)
 *
 * Story Collections:
 * 1. "Comeback Stories" - triumph moments in final minutes
 * 2. "Peak Intensity" - highest action moments with strong emotional impact
 * 3. "Golden Hour Magic" - golden hour photos with excellent composition
 * 4. "Focus & Determination" - determined athletes with technical excellence
 * 5. "Victory Celebrations" - celebration moments with high emotional impact
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('Missing required environment variables:');
	console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
	console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CollectionDefinition {
	slug: string;
	title: string;
	narrative: string;
	description: string;
	query: {
		filters: Record<string, any>;
		minScores?: Record<string, number>;
		sortBy?: string;
		limit?: number;
	};
}

// Story Collection Definitions (HYBRID: Story + Quality)
// Quality floor ensures technical competence while prioritizing narrative fit
const COLLECTIONS: CollectionDefinition[] = [
	{
		slug: 'portfolio-excellence',
		title: 'Portfolio Excellence',
		narrative: 'The absolute best: technical mastery meets emotional impact',
		description: 'Triple-excellent photography—the top tier where sharpness, composition, and emotional impact all score 9/10 or higher. These photos represent the pinnacle of sports photography craft.',
		query: {
			filters: {},
			minScores: {
				sharpness: 9,
				composition_score: 9,
				emotional_impact: 9,
			},
			sortBy: 'sharpness',
			limit: 48, // Show more of the best
		},
	},
	{
		slug: 'comeback-stories',
		title: 'Comeback Stories',
		narrative: 'Critical moments of triumph in the final minutes',
		description: 'Dramatic comebacks and clutch performances when it matters most. These photos capture the intensity and emotion of athletes fighting back in the closing moments of competition.',
		query: {
			filters: {
				emotion: 'triumph',
				time_in_game: 'final_5_min',
			},
			minScores: {
				emotional_impact: 7,
				sharpness: 7, // HYBRID: Add quality floor
				composition_score: 7, // HYBRID: Add quality floor
			},
			sortBy: 'emotional_impact',
			limit: 24,
		},
	},
	{
		slug: 'peak-intensity',
		title: 'Peak Intensity',
		narrative: 'The most intense moments of gameplay',
		description: 'Maximum effort, maximum focus, maximum intensity. These photos freeze the pinnacle of athletic performance—the moments when everything is on the line and athletes give their absolute all.',
		query: {
			filters: {
				action_intensity: 'peak',
			},
			minScores: {
				emotional_impact: 8,
				sharpness: 7,
				composition_score: 7, // HYBRID: Add quality floor
			},
			sortBy: 'emotional_impact',
			limit: 24,
		},
	},
	{
		slug: 'golden-hour-magic',
		title: 'Golden Hour Magic',
		narrative: 'Stunning captures during the magic hour',
		description: 'The warm, ethereal glow of golden hour transforms athletic moments into art. These photos showcase the perfect intersection of technical excellence and natural beauty.',
		query: {
			filters: {
				time_of_day: 'golden_hour',
			},
			minScores: {
				composition_score: 7,
				sharpness: 7,
			},
			sortBy: 'composition_score',
			limit: 24,
		},
	},
	{
		slug: 'focus-and-determination',
		title: 'Focus & Determination',
		narrative: 'Unwavering concentration and relentless drive',
		description: 'The quiet intensity before the storm. These photos capture athletes in moments of pure focus and determination, where mental strength is just as visible as physical prowess.',
		query: {
			filters: {
				emotion: 'determination',
			},
			minScores: {
				sharpness: 8,
				composition_score: 7, // HYBRID: Increase from 6 to 7
				emotional_impact: 7, // HYBRID: Add quality floor
			},
			sortBy: 'sharpness',
			limit: 24,
		},
	},
	{
		slug: 'victory-celebrations',
		title: 'Victory Celebrations',
		narrative: 'Pure joy and shared triumph',
		description: 'The moments after victory—unfiltered emotion, team unity, and the sweet taste of success. These photos capture the human side of sports: the joy, the relief, the celebration.',
		query: {
			filters: {
				photo_category: 'celebration',
			},
			minScores: {
				emotional_impact: 7,
				sharpness: 7, // HYBRID: Add quality floor
				composition_score: 7, // HYBRID: Add quality floor
			},
			sortBy: 'emotional_impact',
			limit: 24,
		},
	},
];

interface PhotoResult {
	photo_id: string;
	image_key: string;
	ImageUrl: string;
	ThumbnailUrl: string;
	photo_date: string | null;
	play_type: string | null;
	action_intensity: string | null;
	sport_type: string | null;
	photo_category: string | null;
	lighting: string | null;
	color_temperature: string | null;
	time_of_day: string | null;
	emotion: string | null;
	sharpness: number | null;
	composition_score: number | null;
	emotional_impact: number | null;
	time_in_game: string | null;
	ai_confidence: number | null;
}

async function generateCollection(collection: CollectionDefinition): Promise<{
	collection: CollectionDefinition;
	photos: PhotoResult[];
	stats: {
		total: number;
		avgSharpness: number;
		avgEmotionalImpact: number;
		avgComposition: number;
	};
}> {
	console.log(`\n🎨 Generating collection: ${collection.title}`);
	console.log(`   Narrative: ${collection.narrative}`);

	// Build query - select all relevant columns
	let query = supabase
		.from('photo_metadata')
		.select('photo_id, image_key, ImageUrl, ThumbnailUrl, photo_date, play_type, action_intensity, sport_type, photo_category, lighting, color_temperature, time_of_day, emotion, sharpness, composition_score, emotional_impact, time_in_game, ai_confidence')
		.not('sharpness', 'is', null); // Only show enriched photos

	// Apply filters (columns are top-level, not nested in metadata JSONB)
	for (const [key, value] of Object.entries(collection.query.filters)) {
		if (Array.isArray(value)) {
			query = query.in(key, value);
		} else {
			query = query.eq(key, value);
		}
	}

	// Apply minimum score filters
	if (collection.query.minScores) {
		for (const [key, minValue] of Object.entries(collection.query.minScores)) {
			query = query.gte(key, minValue);
		}
	}

	// Apply sorting
	if (collection.query.sortBy) {
		query = query.order(collection.query.sortBy, { ascending: false });
	}

	// Apply limit
	const limit = collection.query.limit || 24;
	query = query.limit(limit);

	const { data, error } = await query;

	if (error) {
		console.error(`   ❌ Error fetching photos:`, error);
		throw error;
	}

	const photos = data as PhotoResult[];

	// Calculate stats
	const avgSharpness =
		photos.reduce((sum, p) => sum + (p.sharpness || 0), 0) / photos.length || 0;
	const avgEmotionalImpact =
		photos.reduce((sum, p) => sum + (p.emotional_impact || 0), 0) / photos.length || 0;
	const avgComposition =
		photos.reduce((sum, p) => sum + (p.composition_score || 0), 0) / photos.length || 0;

	const stats = {
		total: photos.length,
		avgSharpness: Math.round(avgSharpness * 10) / 10,
		avgEmotionalImpact: Math.round(avgEmotionalImpact * 10) / 10,
		avgComposition: Math.round(avgComposition * 10) / 10,
	};

	console.log(`   ✅ Found ${photos.length} photos`);
	console.log(`   📊 Stats: Sharpness ${stats.avgSharpness} | Impact ${stats.avgEmotionalImpact} | Composition ${stats.avgComposition}`);

	return { collection, photos, stats };
}

async function main() {
	console.log('🚀 Collections Curation Engine');
	console.log('================================\n');

	const results = [];

	for (const collectionDef of COLLECTIONS) {
		try {
			const result = await generateCollection(collectionDef);
			results.push(result);
		} catch (error) {
			console.error(`Failed to generate collection ${collectionDef.slug}:`, error);
		}
	}

	// Summary
	console.log('\n\n📋 SUMMARY');
	console.log('==========');
	console.log(`Total Collections: ${results.length}/${COLLECTIONS.length}`);
	console.log(`Total Photos Curated: ${results.reduce((sum, r) => sum + r.stats.total, 0)}\n`);

	results.forEach((result) => {
		console.log(`${result.collection.title}:`);
		console.log(`  Photos: ${result.stats.total}`);
		console.log(`  Avg Sharpness: ${result.stats.avgSharpness}`);
		console.log(`  Avg Impact: ${result.stats.avgEmotionalImpact}`);
		console.log(`  Avg Composition: ${result.stats.avgComposition}`);
	});

	// Check for empty collections
	const emptyCollections = results.filter((r) => r.stats.total === 0);
	if (emptyCollections.length > 0) {
		console.log('\n⚠️  WARNING: Empty collections detected');
		emptyCollections.forEach((r) => {
			console.log(`   - ${r.collection.title}: No photos matched criteria`);
			console.log(`     Filters: ${JSON.stringify(r.collection.query.filters)}`);
			console.log(`     Min Scores: ${JSON.stringify(r.collection.query.minScores || {})}`);
		});
		console.log('\n💡 Suggestions:');
		console.log('   1. Check that Bucket 2 metadata is enriched (run backfill-schema-v2-metadata.ts)');
		console.log('   2. Relax minimum score thresholds');
		console.log('   3. Broaden filter criteria');
	}

	console.log('\n✅ Curation complete!');
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
