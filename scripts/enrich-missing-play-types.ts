/**
 * Targeted Re-Enrichment: Action Photos Missing Play Types
 *
 * Purpose: Re-enrich the 2,087 action photos missing play_type field
 *
 * Background:
 * - 74% overall play_type coverage looked bad
 * - But most missing play_types are in candid/portrait/warmup (expected NULL)
 * - Real issue: 2,087 ACTION photos missing play_type (13.9% of action photos)
 *
 * Target Photos:
 * - photo_category = 'action'
 * - play_type IS NULL
 * - Group by sport for sport-specific enrichment
 *
 * Sport Breakdown:
 * - volleyball: 1,104 photos (priority 1 - largest sport)
 * - basketball: 330 photos
 * - track: 161 photos
 * - softball: 141 photos
 * - baseball: 123 photos
 * - soccer: 121 photos
 * - football: 90 photos
 * - other: 38 photos
 *
 * Usage:
 * SPORT_FILTER=volleyball TEST_LIMIT=100 npx tsx scripts/enrich-missing-play-types.ts
 */

import { createClient } from '@supabase/supabase-js';
import { BUCKET1_PROMPT, type Bucket1Response } from '$lib/ai/enrichment-prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY!;

const CONCURRENT_BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;
const DRY_RUN = process.env.DRY_RUN === 'true';
const SPORT_FILTER = process.env.SPORT_FILTER; // Optional: volleyball, basketball, etc.
const TEST_LIMIT = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : undefined;
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

// =============================================================================
// Initialize Clients
// =============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =============================================================================
// AI Extraction
// =============================================================================

interface EnrichmentResult {
  photo_id: string;
  success: boolean;
  play_type?: string | null;
  error?: string;
  cost?: number;
}

async function extractPlayType(
  photoId: string,
  imageUrl: string,
  sportType: string
): Promise<EnrichmentResult> {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Fetch and convert image to base64
    const base64Data = await fetchImageAsBase64(imageUrl);

    // Use BUCKET1_PROMPT (now updated with sport-specific play types)
    const result = await model.generateContent([
      BUCKET1_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Could not extract JSON from Gemini response: ${responseText}`);
    }

    const parsedResult: Bucket1Response = JSON.parse(jsonMatch[0]);

    return {
      photo_id: photoId,
      success: true,
      play_type: parsedResult.play_type,
      cost: 0.000128 // Flash-Lite cost
    };
  } catch (error) {
    console.error(`Failed to extract play_type for ${photoId}:`, error);
    return {
      photo_id: photoId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// =============================================================================
// Database Operations
// =============================================================================

async function getActionPhotosNeedingPlayType(limit: number) {
  let query = supabase
    .from('photo_metadata')
    .select('photo_id, ImageUrl, ThumbnailUrl, sport_type')
    .eq('photo_category', 'action') // ONLY action photos
    .is('play_type', null); // Missing play_type

  // Optional sport filter
  if (SPORT_FILTER) {
    query = query.eq('sport_type', SPORT_FILTER);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

async function updatePlayType(result: EnrichmentResult) {
  if (!result.success || DRY_RUN) {
    return;
  }

  const { error } = await supabase
    .from('photo_metadata')
    .update({
      play_type: result.play_type,
      enriched_at: new Date().toISOString() // Update enrichment timestamp
    })
    .eq('photo_id', result.photo_id);

  if (error) {
    console.error(`Failed to update ${result.photo_id}:`, error);
    throw error;
  }
}

// =============================================================================
// Progress Tracking
// =============================================================================

interface ProgressStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  totalCost: number;
  startTime: Date;
}

function printProgress(stats: ProgressStats) {
  const elapsed = (Date.now() - stats.startTime.getTime()) / 1000 / 60;
  const rate = stats.processed / elapsed;
  const remaining = (stats.total - stats.processed) / rate;

  console.log(`
┌─────────────────────────────────────────┐
│  Play Type Re-Enrichment Progress      │
├─────────────────────────────────────────┤
│  Processed:   ${stats.processed.toString().padStart(6)}/${stats.total}  (${((stats.processed / stats.total) * 100).toFixed(1)}%)
│  Successful:  ${stats.successful.toString().padStart(6)}            │
│  Failed:      ${stats.failed.toString().padStart(6)}            │
│  Cost:        $${stats.totalCost.toFixed(2).padStart(6)}          │
│  Elapsed:     ${elapsed.toFixed(1).padStart(6)} min       │
│  Rate:        ${rate.toFixed(1).padStart(6)} photos/min  │
│  Remaining:   ${remaining.toFixed(1).padStart(6)} min       │
└─────────────────────────────────────────┘
  `);
}

// =============================================================================
// Main Re-Enrichment Process
// =============================================================================

async function enrichMissingPlayTypes() {
  console.log('🎯 Targeted Re-Enrichment: Action Photos Missing Play Types\n');

  console.log('⚙️  Configuration:');
  console.log(`   Model: ${GEMINI_MODEL}`);
  console.log(`   Prompt: BUCKET1_PROMPT (updated with sport-specific play types)`);
  console.log(`   Est. cost per photo: $0.000128`);
  console.log(`   Concurrent batch size: ${CONCURRENT_BATCH_SIZE} photos at a time`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE: No database writes will occur');
  }

  if (SPORT_FILTER) {
    console.log(`\n🏀 SPORT FILTER: Only enriching ${SPORT_FILTER} action photos`);
  }

  console.log('');

  // Get total count
  let countQuery = supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('photo_category', 'action')
    .is('play_type', null);

  if (SPORT_FILTER) {
    countQuery = countQuery.eq('sport_type', SPORT_FILTER);
  }

  const { count } = await countQuery;
  let total = count || 0;

  if (total === 0) {
    console.log('✅ No action photos need play_type enrichment!');
    return;
  }

  // Apply test limit if specified
  if (TEST_LIMIT && TEST_LIMIT < total) {
    console.log(`📊 Found ${total} action photos needing play_type`);
    console.log(`🧪 TEST_LIMIT: Processing only first ${TEST_LIMIT} photos\n`);
    total = TEST_LIMIT;
  } else {
    console.log(`Found ${total} action photos needing play_type enrichment\n`);
  }

  const stats: ProgressStats = {
    total,
    processed: 0,
    successful: 0,
    failed: 0,
    totalCost: 0,
    startTime: new Date()
  };

  // Fetch all photos needing enrichment
  const allPhotos = await getActionPhotosNeedingPlayType(total);

  if (allPhotos.length === 0) {
    console.log('✅ No action photos need play_type enrichment!');
    return;
  }

  console.log(`Processing ${allPhotos.length} photos in batches of ${CONCURRENT_BATCH_SIZE}...\n`);

  // Process in concurrent batches
  for (let i = 0; i < allPhotos.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = allPhotos.slice(i, i + CONCURRENT_BATCH_SIZE);

    await Promise.all(
      batch.map(async (photo) => {
        try {
          const imageUrl = photo.ThumbnailUrl || photo.ImageUrl;
          const result = await extractPlayType(photo.photo_id, imageUrl, photo.sport_type);

          if (result.success) {
            await updatePlayType(result);
            stats.successful++;
            stats.totalCost += result.cost || 0;
          } else {
            stats.failed++;
            console.error(`❌ Failed: ${result.photo_id} - ${result.error}`);
          }

          stats.processed++;
        } catch (error) {
          stats.failed++;
          stats.processed++;
          console.error(`❌ Error processing ${photo.photo_id}:`, error);
        }
      })
    );

    printProgress(stats);

    // Rate limiting between batches
    if (i + CONCURRENT_BATCH_SIZE < allPhotos.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  // Final summary
  console.log('\n✅ Re-enrichment complete!\n');
  printProgress(stats);

  // Validation
  console.log('\nRunning validation queries...\n');

  const { data: actionStats } = await supabase
    .from('photo_metadata')
    .select('play_type')
    .eq('photo_category', 'action')
    .not('play_type', 'is', null);

  const { count: totalAction } = await supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .eq('photo_category', 'action');

  const coverage = ((actionStats?.length || 0) / (totalAction || 1)) * 100;

  console.log(`Action photos with play_type: ${actionStats?.length || 0} / ${totalAction || 0} (${coverage.toFixed(1)}%)`);
  console.log('\n✅ Re-enrichment validation complete!');
}

// =============================================================================
// Run Script
// =============================================================================

enrichMissingPlayTypes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

// =============================================================================
// Usage Instructions
// =============================================================================

/*
USAGE:

1. Test run (first 10 volleyball photos):
   SPORT_FILTER=volleyball TEST_LIMIT=10 npx tsx scripts/enrich-missing-play-types.ts

2. Full volleyball run (1,104 photos):
   SPORT_FILTER=volleyball npx tsx scripts/enrich-missing-play-types.ts

3. All sports (2,087 photos):
   npx tsx scripts/enrich-missing-play-types.ts

4. Basketball only (330 photos):
   SPORT_FILTER=basketball npx tsx scripts/enrich-missing-play-types.ts

5. Dry run (test without writing):
   DRY_RUN=true TEST_LIMIT=5 npx tsx scripts/enrich-missing-play-types.ts

ENVIRONMENT VARIABLES:

Required:
- VITE_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_API_KEY

Optional:
- SPORT_FILTER: volleyball, basketball, soccer, softball, baseball, football, track
- TEST_LIMIT: Number of photos to process (for testing)
- DRY_RUN: Set to 'true' to test without writing

COST ESTIMATE:

- Volleyball (1,104 photos): ~$0.14
- Basketball (330 photos): ~$0.04
- All sports (2,087 photos): ~$0.27

RECOMMENDED APPROACH:

1. Test with 10 photos first
2. Run volleyball (largest group)
3. Run other sports if needed
4. Validate results

*/
