/**
 * Backfill Script: Schema v2.0 - New Metadata Fields
 *
 * Purpose: Populate new columns added in schema v2.0 migration
 *
 * New Fields to Backfill:
 * - Bucket 1 (user-facing): lighting, color_temperature
 * - Bucket 2 (internal): time_in_game, athlete_id, event_id, ai_confidence
 *
 * Strategy:
 * 1. Extract new user-facing fields via AI (Bucket 1 prompt)
 * 2. Extract new internal fields via AI (Bucket 2 prompt)
 * 3. Update database in batches for performance
 * 4. Track progress and costs
 *
 * Cost Estimate: $0.006-0.015 per photo (combined prompt)
 * For 20,000 photos: $120-300 total
 *
 * Run time: ~3-5 hours (rate-limited API calls)
 */

import { createClient } from '@supabase/supabase-js';
import { COMBINED_PROMPT, type CombinedResponse } from '$lib/ai/enrichment-prompts';

// =============================================================================
// Configuration
// =============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY!;

const BATCH_SIZE = 50; // Process 50 photos at a time
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between API calls
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set to 'true' to test without writing to DB
const ALBUM_KEY = process.env.ALBUM_KEY; // Optional: Filter by specific album for testing

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
    // Call Gemini Vision API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: COMBINED_PROMPT },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: await fetchImageAsBase64(imageUrl)
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[Gemini API Error]', JSON.stringify(data, null, 2));
      throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`);
    }
    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const result: CombinedResponse = JSON.parse(text);

    return {
      photo_id: photoId,
      success: true,
      bucket1: {
        lighting: result.bucket1.lighting,
        color_temperature: result.bucket1.color_temperature
      },
      bucket2: {
        time_in_game: result.bucket2.time_in_game,
        ai_confidence: result.bucket2.ai_confidence
      },
      cost: 0.01 // Estimated cost per photo
    };
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
    .select('photo_id, ImageUrl, ThumbnailUrl, album_key')
    .is('lighting', null); // Photos missing new fields

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
  console.log('Starting Schema v2.0 metadata backfill...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE: No database writes will occur\n');
  }

  if (ALBUM_KEY) {
    console.log(`🎯 ALBUM FILTER: Running isolated test on album_key="${ALBUM_KEY}"\n`);
  }

  // Get total count (with optional album filter)
  let countQuery = supabase
    .from('photo_metadata')
    .select('photo_id', { count: 'exact', head: true })
    .is('lighting', null);

  if (ALBUM_KEY) {
    countQuery = countQuery.eq('album_key', ALBUM_KEY);
  }

  const { count } = await countQuery;

  const total = count || 0;

  if (total === 0) {
    console.log('✅ No photos need backfilling. All photos have new metadata!');
    return;
  }

  console.log(`Found ${total} photos needing backfill\n`);

  const stats: ProgressStats = {
    total,
    processed: 0,
    successful: 0,
    failed: 0,
    totalCost: 0,
    startTime: new Date()
  };

  // Process in batches
  while (stats.processed < total) {
    // Get next batch
    const photos = await getPhotosNeedingBackfill(BATCH_SIZE);

    if (photos.length === 0) break;

    // Process each photo in batch
    for (const photo of photos) {
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

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));

      // Print progress every 10 photos
      if (stats.processed % 10 === 0) {
        printProgress(stats);
      }
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

1. Dry run (test without writing to database):
   DRY_RUN=true npm run backfill:schema-v2

2. Production run (writes to database):
   npm run backfill:schema-v2

3. Resume from failure:
   Script automatically skips photos that already have new metadata
   Just run again: npm run backfill:schema-v2

4. Monitor progress:
   Progress is printed every 10 photos
   Check console for success/failure counts

ENVIRONMENT VARIABLES REQUIRED:

- VITE_SUPABASE_URL: Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: Service role key (bypasses RLS)
- GEMINI_API_KEY: Google AI Gemini API key

ESTIMATED COSTS:

- $0.01 per photo (Gemini 1.5 Flash)
- 20,000 photos = ~$200
- Runtime: 3-5 hours (rate-limited)

ROLLBACK:

If backfill fails or produces bad data:
1. Run migration rollback (restores from backup table)
2. Fix issues
3. Re-run backfill

MONITORING:

Watch for:
- API rate limit errors (should auto-throttle)
- Failed extractions (check error messages)
- Unexpected values (validate sample of results)
- Cost tracking (should match estimate)
*/
