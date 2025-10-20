# Week 1 Implementation Guide - Foundation (Schema + SEO)

**Status**: Ready for execution
**Database Backup**: ✅ Completed
**Files Created**: ✅ All migration and route files ready
**Next Action**: Apply SQL migrations to Supabase

---

## Overview

This guide walks you through Week 1 of the MASTER_IMPLEMENTATION_PLAN.md, focusing on:
1. **Database schema migration** (sport taxonomy)
2. **Data inference** (backfill 20K photos via SQL)
3. **Individual photo URLs** (SEO + shareability)
4. **Sitemap & robots.txt** (search engine discoverability)
5. **AI metadata** (bot discoverability)

---

## Day 1: Schema Migration - Add Sport Taxonomy Columns

### What Was Created
- ✅ `supabase/migrations/20251019_add_sport_taxonomy.sql`
- ✅ Schema adds 3 new columns: `sport_type`, `photo_category`, `action_type`
- ✅ Backward compatible (additive, no breaking changes)
- ✅ Includes indexes for performance

### Your Action Required: Apply Migration to Supabase

#### Option A: Via Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to "SQL Editor" in left sidebar

2. **Copy Migration SQL**
   ```bash
   # Open the file and copy its contents
   cat supabase/migrations/20251019_add_sport_taxonomy.sql
   ```

3. **Paste and Run in SQL Editor**
   - Paste the SQL into the editor
   - Click "Run" button
   - Wait for success confirmation

4. **Verify Columns Added**
   Run this verification query:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'photo_metadata'
     AND column_name IN ('sport_type', 'photo_category', 'action_type');
   ```

   Expected result: 3 rows showing the new columns

#### Option B: Via Supabase CLI (Alternative)

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Run migration
npx supabase db push
```

### Rollback Plan (If Needed)

If something goes wrong, you can remove the columns:
```sql
ALTER TABLE photo_metadata
DROP COLUMN IF EXISTS sport_type,
DROP COLUMN IF EXISTS photo_category,
DROP COLUMN IF EXISTS action_type;
```

---

## Day 2: Data Inference - Backfill Sport Taxonomy

### What Was Created
- ✅ `supabase/migrations/20251019_infer_sport_taxonomy.sql`
- ✅ SQL logic to classify 20K photos without AI API calls
- ✅ Expected accuracy: 80-90% via keyword/album/play_type inference

### Your Action Required: Apply Inference SQL

1. **Open Supabase SQL Editor**
   (Same as Day 1, Step 1)

2. **Copy Inference SQL**
   ```bash
   cat supabase/migrations/20251019_infer_sport_taxonomy.sql
   ```

3. **Paste and Run in SQL Editor**
   - Click "Run" button
   - Wait for completion (may take 30-60 seconds for 20K rows)

4. **Verify Results**

   **Check sport_type distribution:**
   ```sql
   SELECT sport_type, COUNT(*) as count
   FROM photo_metadata
   WHERE sport_type IS NOT NULL
   GROUP BY sport_type
   ORDER BY count DESC;
   ```

   Expected results:
   - `volleyball`: ~14,000-16,000
   - `portrait`: ~2,000-3,000
   - `basketball`, `soccer`, etc.: smaller counts

   **Check photo_category distribution:**
   ```sql
   SELECT photo_category, COUNT(*) as count
   FROM photo_metadata
   WHERE photo_category IS NOT NULL
   GROUP BY photo_category
   ORDER BY count DESC;
   ```

   Expected results:
   - `action`: ~10,000-12,000
   - `candid`: ~4,000-6,000
   - `portrait`, `celebration`, etc.: smaller counts

   **Check for nulls:**
   ```sql
   SELECT
     COUNT(*) as total_photos,
     COUNT(sport_type) as sport_type_filled,
     COUNT(photo_category) as photo_category_filled,
     COUNT(*) FILTER (WHERE sport_type IS NULL) as missing_sport,
     COUNT(*) FILTER (WHERE photo_category IS NULL) as missing_category
   FROM photo_metadata;
   ```

   Expected: Less than 10% missing (under 2,000 photos)

### Manual Review (Optional)

Export photos that couldn't be classified for manual tagging:
```sql
COPY (
  SELECT image_key, title, caption, keywords, album_name
  FROM photo_metadata
  WHERE sport_type IS NULL OR photo_category IS NULL
) TO '/tmp/photos_for_manual_review.csv' WITH CSV HEADER;
```

---

## Day 3: Individual Photo URLs - SEO + Shareability

### What Was Created
- ✅ `src/routes/photo/[id]/+page.server.ts` - Server-side data loading with SEO
- ✅ `src/routes/photo/[id]/+page.svelte` - Photo detail page with meta tags
- ✅ `src/lib/components/gallery/PhotoCard.svelte` - Updated to use anchor tags

### Features Implemented

1. **Individual Photo URLs**
   - Format: `https://photography.ninochavez.co/photo/{image_key}`
   - Each photo has its own shareable URL
   - Direct navigation (not just modal)

2. **Open Graph Meta Tags**
   - `og:title`, `og:description`, `og:image`
   - Optimized for Facebook, LinkedIn, Slack sharing
   - Preview cards show photo thumbnail + metadata

3. **Twitter Cards**
   - `twitter:card`, `twitter:title`, `twitter:image`
   - Large image preview on Twitter/X

4. **Schema.org Structured Data**
   - Type: `Photograph`
   - Includes creator, keywords, sport, category, emotion
   - Helps Google understand photo content

### Your Action Required: Test Routes

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Individual Photo URL**
   - Navigate to any photo in the gallery
   - Click on a PhotoCard
   - Verify URL changes to `/photo/{image_key}`
   - Check that modal opens with photo details

3. **Test Share Preview (After Deployment)**
   - Deploy to Vercel: `npm run build && vercel deploy`
   - Copy a photo URL (e.g., `https://photography.ninochavez.co/photo/ABC123`)
   - Paste into Twitter, Facebook, or Slack
   - Verify rich preview card appears with photo thumbnail

---

## Day 4: Sitemap & Robots.txt - Search Engine Discoverability

### What Was Created
- ✅ `src/routes/sitemap.xml/+server.ts` - Dynamic sitemap generator
- ✅ `src/routes/robots.txt/+server.ts` - Robots.txt with AI bot rules
- ✅ `static/ai-metadata.json` - AI bot discoverability metadata

### Features Implemented

1. **Dynamic Sitemap (`/sitemap.xml`)**
   - Generates 20,000+ photo URLs
   - Includes static pages (home, explore, collections, albums)
   - Sport-specific landing pages
   - Album detail pages
   - Priority scores for portfolio-worthy photos
   - Auto-updates as new photos are added

2. **Robots.txt (`/robots.txt`)**
   - Allows all crawlers (Google, Bing, etc.)
   - Specific rules for AI bots:
     - GPTBot (ChatGPT)
     - ClaudeBot (Claude)
     - PerplexityBot
     - Google-Extended
   - Links to sitemap.xml

3. **AI Metadata (`/ai-metadata.json`)**
   - Structured JSON-LD for AI assistants
   - Portfolio composition (70/20/10)
   - AI enrichment details
   - Technical capabilities
   - SEO keywords and use cases

### Your Action Required: Test & Submit

1. **Test Sitemap in Browser**
   ```bash
   # Start dev server
   npm run dev

   # Open in browser
   open http://localhost:5173/sitemap.xml
   ```

   Verify:
   - XML renders correctly
   - Contains 20,000+ URLs
   - Photo URLs formatted as `/photo/{image_key}`

2. **Test Robots.txt**
   ```bash
   open http://localhost:5173/robots.txt
   ```

   Verify:
   - Plain text format
   - Includes AI bot rules
   - Links to sitemap.xml

3. **Test AI Metadata**
   ```bash
   open http://localhost:5173/ai-metadata.json
   ```

   Verify:
   - JSON renders correctly
   - Contains portfolio stats
   - Schema.org structured data

---

## Day 5: Search Console & Testing

### Your Action Required: Submit to Google

1. **Deploy to Production**
   ```bash
   npm run build
   vercel deploy --prod
   ```

2. **Submit Sitemap to Google Search Console**
   - Go to https://search.google.com/search-console
   - Add property: `https://photography.ninochavez.co`
   - Verify ownership (DNS or HTML meta tag)
   - Navigate to "Sitemaps" in left sidebar
   - Enter: `https://photography.ninochavez.co/sitemap.xml`
   - Click "Submit"
   - Wait 1-2 days for Google to crawl

3. **Test Share Previews**

   **Facebook/LinkedIn:**
   - Go to https://developers.facebook.com/tools/debug/
   - Enter a photo URL: `https://photography.ninochavez.co/photo/{image_key}`
   - Click "Debug"
   - Verify rich preview appears

   **Twitter:**
   - Go to https://cards-dev.twitter.com/validator
   - Enter a photo URL
   - Verify large image card appears

   **Slack:**
   - Paste photo URL in any Slack channel
   - Verify preview unfurls with thumbnail

4. **Monitor Indexing**
   - Check Google Search Console "Coverage" report
   - Look for 20,000+ indexed pages (may take 2-4 weeks)
   - Monitor for crawl errors

---

## Verification Checklist

Before moving to Week 2, confirm:

- [ ] Schema migration applied successfully to Supabase
- [ ] sport_type populated for 90%+ photos
- [ ] photo_category populated for 95%+ photos
- [ ] Individual photo URLs work (`/photo/{image_key}`)
- [ ] PhotoCard components link to individual URLs
- [ ] Sitemap.xml renders 20K+ URLs
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] AI metadata accessible at `/ai-metadata.json`
- [ ] Sitemap submitted to Google Search Console
- [ ] Share previews tested on Twitter/Facebook/Slack
- [ ] OG images load correctly in previews

---

## Rollback Plan

If you need to undo Week 1 changes:

### Revert Database Schema
```sql
UPDATE photo_metadata
SET sport_type = NULL, photo_category = NULL, action_type = NULL;

ALTER TABLE photo_metadata
DROP COLUMN IF EXISTS sport_type,
DROP COLUMN IF EXISTS photo_category,
DROP COLUMN IF EXISTS action_type;
```

### Revert Code Changes
```bash
git log --oneline  # Find commit before Week 1
git revert {commit-hash}  # Revert to previous state
```

---

## Next Steps: Week 2 - Discovery

After Week 1 is complete, proceed to Week 2 (MASTER_IMPLEMENTATION_PLAN.md):
- Search autocomplete with sport filtering
- FilterBar with sport taxonomy
- Timeline view for chronological browsing
- Performance optimization (virtual scrolling)

---

## Troubleshooting

### Issue: Sitemap returns 500 error

**Cause**: Supabase query failing (likely schema not migrated)
**Fix**:
1. Check Supabase logs for error details
2. Verify schema migration was applied
3. Test Supabase query in SQL Editor:
   ```sql
   SELECT image_key, photo_date, portfolio_worthy, sport_type
   FROM photo_metadata
   LIMIT 10;
   ```

### Issue: Photo detail page shows 404

**Cause**: Photo not found in database or incorrect image_key
**Fix**:
1. Verify image_key exists in Supabase:
   ```sql
   SELECT image_key, title FROM photo_metadata WHERE image_key = 'YOUR_KEY';
   ```
2. Check for case sensitivity (image_key should match exactly)

### Issue: Share preview doesn't show image

**Cause**: OG image URL incorrect or CORS issue
**Fix**:
1. Verify `og:image` meta tag in page source (View Page Source)
2. Check image URL is absolute (not relative)
3. Ensure image URL is publicly accessible (test in incognito)
4. Check image size (recommended: 1200x630px for OG)

---

## Cost Analysis

### Week 1 Costs
- **Supabase**: $0 (within free tier for existing data)
- **AI API calls**: $0 (using SQL inference, not re-enriching)
- **Vercel**: $0 (within free tier for hobby projects)
- **Development time**: 1 week (autonomous execution)

### Cost Savings vs Re-enrichment
- **Option A** (Re-enrich 20K photos): $350
- **Option B** (SQL inference): $0
- **Savings**: $350 ✅

---

## Success Metrics

Track these KPIs after Week 1 deployment:

1. **Google Search Console** (after 2-4 weeks):
   - Total indexed pages: 20,000+
   - Average position for "{your name} volleyball photography": Top 10
   - Impressions: 1,000+/month
   - Clicks: 50+/month

2. **Social Sharing**:
   - Share preview success rate: 95%+
   - OG image load time: <2 seconds
   - Twitter Card validation: Pass

3. **AI Bot Discoverability**:
   - ChatGPT finds site when asked about volleyball photography
   - Claude references correct portfolio stats
   - Perplexity includes site in sports photography results

---

## Questions?

If you encounter issues during Week 1 implementation:
1. Check this guide's Troubleshooting section
2. Review MASTER_IMPLEMENTATION_PLAN.md for strategic context
3. Check Supabase logs for database errors
4. Review browser console for frontend errors
5. Ask for help with specific error messages

**Ready to begin? Start with Day 1: Schema Migration** 🚀
