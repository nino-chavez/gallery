/**
 * Backfill Script: Schema v2.0 - New Metadata Fields (Concurrent)
 *
 * Purpose: Populate new columns added in schema v2.0 migration
 *
 * New Fields to Backfill:
 * - Bucket 1 (user-facing): lighting, color_temperature
 * - Bucket 2 (internal): time_in_game, athlete_id, event_id, ai_confidence
 *
 * Strategy:
 * 1. Filter to photos from last 24 months (reduces scope & cost)
 * 2. Process 50 concurrent API calls per batch (50x faster)
 * 3. Extract metadata via combined prompt (Bucket 1 + Bucket 2)
 * 4. Update database after each batch completes
 * 5. Track progress and costs
 *
 * Performance:
 * - Concurrent batch size: 50 photos at a time
 * - Rate limiting: 1 second delay between batches
 * - Expected throughput: ~750 photos/min (50x improvement)
 *
 * Cost Estimate: $0.01 per photo (Gemini 2.0 Flash)
 * - Last 24 months (~8,000-12,000 photos): $80-120
 * - Full 20,000 photos: ~$200
 *
 * Run time:
 * - Last 24 months: ~15-20 minutes (concurrent)
 * - Full 20,000 photos: ~30-40 minutes (concurrent)
 */

import { createClient } from '@supabase/supabase-js';
import {
  COMBINED_PROMPT,
  SCHEMA_V2_DELTA_PROMPT,
  type CombinedResponse,
  type SchemaV2DeltaResponse
} from '$lib/ai/enrichment-prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// =============================================================================
// Configuration
// =============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY!;

const CONCURRENT_BATCH_SIZE = 50; // Process 50 photos concurrently (Gemini can handle this)
const DB_FETCH_LIMIT = 500; // Fetch photos from DB in larger chunks
const BATCH_DELAY_MS = 1000; // 1 second delay between concurrent batches (rate limiting)
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to 'true' to test without writing to DB
const ALBUM_KEY = process.env.ALBUM_KEY; // Optional: Filter by specific album for testing
const MONTHS_BACK = parseInt(process.env.MONTHS_BACK || '24'); // Default: last 24 months
const TEST_LIMIT = process.env.TEST_LIMIT ? parseInt(process.env.TEST_LIMIT) : undefined; // Optional: Limit for testing

// Cost optimization options
const USE_SIMPLIFIED_PROMPT = process.env.USE_SIMPLIFIED_PROMPT !== 'false'; // Default: true (use minimal prompt)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite'; // Model selection
// Options:
// - 'gemini-2.0-flash-lite' (default): $0.000128/photo, best cost efficiency
// - 'gemini-2.5-flash-lite': $0.000170/photo, newer generation
// - 'gemini-2.0-flash': $0.000170/photo, more capable if needed

// =============================================================================
// Initialize Clients
// =============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =============================================================================
// AI Extraction (Gemini Vision API)
// =============================================================================

interface EnrichmentResult {
  photo_id: string;
  success: boolean;
  bucket1?: {
    lighting: string;
    color_temperature: string;
  };
  bucket2?: {
    time_in_game: string | null;
    ai_confidence: number;
  };
  error?: string;
  cost?: number;
}

async function extractNewMetadata(
  photoId: string,
  imageUrl: string
): Promise<EnrichmentResult> {
  try {
    // Use SDK approach (proven working)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Fetch and convert image to base64
    const base64Data = await fetchImageAsBase64(imageUrl);

    // Select prompt based on configuration
    const prompt = USE_SIMPLIFIED_PROMPT ? SCHEMA_V2_DELTA_PROMPT : COMBINED_PROMPT;

    // Call Gemini using SDK
    const result = await model.generateContent([
      prompt,
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

    // Parse JSON response based on prompt type
    if (USE_SIMPLIFIED_PROMPT) {
      const parsedResult: SchemaV2DeltaResponse = JSON.parse(jsonMatch[0]);

      return {
        photo_id: photoId,
        success: true,
        bucket1: {
          lighting: parsedResult.lighting,
          color_temperature: parsedResult.color_temperature
        },
        bucket2: {
          time_in_game: parsedResult.time_in_game,
          ai_confidence: parsedResult.ai_confidence
        },
        cost: 0.000128 // Actual cost per photo (Flash-Lite + simplified prompt)
      };
    } else {
      const parsedResult: CombinedResponse = JSON.parse(jsonMatch[0]);

      return {
        photo_id: photoId,
        success: true,
        bucket1: {
          lighting: parsedResult.bucket1.lighting,
          color_temperature: parsedResult.bucket1.color_temperature
        },
        bucket2: {
          time_in_game: parsedResult.bucket2.time_in_game,
          ai_confidence: parsedResult.bucket2.ai_confidence
        },
        cost: 0.000170 // Estimated cost per photo (Flash-Lite + full prompt)
      };
    }
  } catch (error) {
    console.error(`Failed to extract metadata for ${photoId}:`, error);
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

async function getPhotosNeedingBackfill(limit: number) {
  let query = supabase
    .from('photo_metadata')
    .select('photo_id, ImageUrl, ThumbnailUrl, album_key, photo_date')
    .is('lighting', null); // Photos missing new fields

  // Filter to last N months (default: 24)
  if (!ALBUM_KEY) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_BACK);
    query = query.gte('photo_date', cutoffDate.toISOString());
  }

  // Optional album filter for isolated testing
  if (ALBUM_KEY) {
    query = query.eq('album_key', ALBUM_KEY);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw error;
  return data;
}

async function updatePhotoMetadata(result: EnrichmentResult) {
  if (!result.success || DRY_RUN) {
    return;
  }

  const { error } = await supabase
    .from('photo_metadata')
    .update({
      lighting: result.bucket1?.lighting,
      color_temperature: result.bucket1?.color_temperature,
      time_in_game: result.bucket2?.time_in_game,
      ai_confidence: result.bucket2?.ai_confidence
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
  const elapsed = (Date.now() - stats.startTime.getTime()) / 1000 / 60; // minutes
  const rate = stats.processed / elapsed; // photos per minute
  const remaining = (stats.total - stats.processed) / rate; // minutes

  console.log(`
┌─────────────────────────────────────────┐
│  Backfill Progress                      │
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
// Main Backfill Process
// =============================================================================

async function backfillNewMetadata() {
  console.log('Starting Schema v2.0 metadata backfill (Concurrent)...\n');

  console.log('⚙️  Configuration:');
  console.log(`   Model: ${GEMINI_MODEL}`);
  console.log(`   Prompt: ${USE_SIMPLIFIED_PROMPT ? 'Simplified (4 fields only)' : 'Combined (15 fields)'}`);
  console.log(`   Est. cost per photo: $${USE_SIMPLIFIED_PROMPT ? '0.000128' : '0.000170'}`);
  console.log(`   Concurrent batch size: ${CONCURRENT_BATCH_SIZE} photos at a time`);
  console.log(`   Rate limiting: ${BATCH_DELAY_MS}ms delay between batches`);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE: No database writes will occur');
  }

  if (ALBUM_KEY) {
    console.log(`\n🎯 ALBUM FILTER: Running isolated test on album_key="${ALBUM_KEY}"`);
  } else {
    console.log(`\n📅 DATE FILTER: Processing photos from last ${MONTHS_BACK} months`);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_BACK);
    console.log(`   Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
  }

  console.log('');

  // Get total count (with date and optional album filters)
  let countQuery = supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .is('lighting', null);

  // Filter to last N months (default: 24)
  if (!ALBUM_KEY) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_BACK);
    countQuery = countQuery.gte('photo_date', cutoffDate.toISOString());
  }

  if (ALBUM_KEY) {
    countQuery = countQuery.eq('album_key', ALBUM_KEY);
  }

  const { count } = await countQuery;

  let total = count || 0;

  if (total === 0) {
    console.log('✅ No photos need backfilling. All photos have new metadata!');
    return;
  }

  // Apply test limit if specified
  if (TEST_LIMIT && TEST_LIMIT < total) {
    console.log(`📊 Found ${total} photos needing backfill`);
    console.log(`🧪 TEST_LIMIT: Processing only first ${TEST_LIMIT} photos\n`);
    total = TEST_LIMIT;
  } else {
    console.log(`Found ${total} photos needing backfill\n`);
  }

  const stats: ProgressStats = {
    total,
    processed: 0,
    successful: 0,
    failed: 0,
    totalCost: 0,
    startTime: new Date()
  };

  // Fetch all photos needing backfill
  const allPhotos = await getPhotosNeedingBackfill(total);

  if (allPhotos.length === 0) {
    console.log('✅ No photos need backfilling. All photos have new metadata!');
    return;
  }

  console.log(`Processing ${allPhotos.length} photos in batches of ${CONCURRENT_BATCH_SIZE}...\n`);

  // Process in concurrent batches (legacy app pattern)
  for (let i = 0; i < allPhotos.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = allPhotos.slice(i, i + CONCURRENT_BATCH_SIZE);

    // Process all photos in batch concurrently using Promise.all
    await Promise.all(
      batch.map(async (photo) => {
        try {
          // Extract new metadata via AI
          const imageUrl = photo.ThumbnailUrl || photo.ImageUrl;
          const result = await extractNewMetadata(photo.photo_id, imageUrl);

          // Update database
          if (result.success) {
            await updatePhotoMetadata(result);
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

    // Print progress after each batch
    printProgress(stats);

    // Rate limiting: delay between batches (not between individual photos)
    if (i + CONCURRENT_BATCH_SIZE < allPhotos.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  // Final summary
  console.log('\n✅ Backfill complete!\n');
  printProgress(stats);

  // Validation
  console.log('\nRunning validation queries...\n');

  const { data: lightingStats } = await supabase
    .from('photo_metadata')
    .select('lighting')
    .not('lighting', 'is', null);

  const { data: colorStats } = await supabase
    .from('photo_metadata')
    .select('color_temperature')
    .not('color_temperature', 'is', null);

  console.log(`Photos with lighting data: ${lightingStats?.length || 0}`);
  console.log(`Photos with color_temperature data: ${colorStats?.length || 0}`);

  console.log('\n✅ Backfill validation complete!');
}

// =============================================================================
// Run Script
// =============================================================================

backfillNewMetadata()
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

1. Production run (last 24 months, default):
   npx tsx scripts/backfill-schema-v2-metadata.ts

2. Test run (first 200 photos):
   TEST_LIMIT=200 npx tsx scripts/backfill-schema-v2-metadata.ts

3. Custom time range (e.g., last 12 months):
   MONTHS_BACK=12 npx tsx scripts/backfill-schema-v2-metadata.ts

4. Dry run (test without writing to database):
   DRY_RUN=true TEST_LIMIT=10 npx tsx scripts/backfill-schema-v2-metadata.ts

5. Isolated test on specific album:
   ALBUM_KEY="vla-630-breeze" npx tsx scripts/backfill-schema-v2-metadata.ts

6. Resume from failure:
   Script automatically skips photos that already have new metadata
   Just run again: npx tsx scripts/backfill-schema-v2-metadata.ts

ENVIRONMENT VARIABLES:

Required:
- VITE_SUPABASE_URL: Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: Service role key (bypasses RLS)
- GOOGLE_API_KEY: Google AI Gemini API key

Optional:
- MONTHS_BACK: Filter to photos from last N months (default: 24)
- ALBUM_KEY: Filter to specific album (disables date filter)
- TEST_LIMIT: Limit number of photos to process (useful for testing)
- DRY_RUN: Set to 'true' to test without database writes

PERFORMANCE (CONCURRENT):

- Batch size: 50 concurrent API calls per batch
- Rate limiting: 1 second delay between batches
- Throughput: ~750 photos/min (50x faster than sequential)

ESTIMATED COSTS & TIME:

Last 24 months (~8,000-12,000 photos):
- Cost: $80-120
- Time: ~15-20 minutes

Full 20,000 photos:
- Cost: ~$200
- Time: ~30-40 minutes

ROLLBACK:

If backfill fails or produces bad data:
1. Run migration rollback (restores from backup table)
2. Fix issues
3. Re-run backfill

MONITORING:

Progress is printed after each batch of 50 photos
Watch for:
- Successful/failed counts
- Cost tracking
- Rate per minute
- Error messages
*/
