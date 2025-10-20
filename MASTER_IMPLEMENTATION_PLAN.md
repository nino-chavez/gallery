# MASTER IMPLEMENTATION PLAN
## Nino Chavez Gallery - SvelteKit Multi-Sport Architecture

**Date:** October 19, 2025
**Status:** CANONICAL EXECUTION ROADMAP
**Purpose:** Single source of truth for all implementation work

---

## 🎯 WHAT WE'RE BUILDING

**Strategic Goal:** Multi-sport photography gallery with SEO dominance and AI-curated discovery

**Current State:**
- ✅ SvelteKit migration Phase 1-4 complete (core app functional)
- ✅ 20,000+ photos with AI enrichment ($300 invested)
- ⚠️ Volleyball-only schema and prompts
- ❌ Zero SEO implementation
- ❌ Not shareable (no individual photo URLs)

**Target State (4 weeks):**
- ✅ Multi-sport taxonomy (volleyball, basketball, soccer, portraits)
- ✅ Google-indexed 20K+ photo URLs
- ✅ Shareable on social media (Open Graph previews)
- ✅ Sport-agnostic enrichment for new photos
- ✅ Production-ready with analytics

---

## 📋 CONSOLIDATED STRATEGIC DECISIONS

### 1. Positioning (from POSITIONING_STRATEGY.md)
- **70/20/10 Portfolio:** Volleyball (flagship), Portraits (differentiation), Other Sports (versatility)
- **Tagline:** "Sports photographer specializing in volleyball with multi-sport expertise"
- **SEO Strategy:** "Nino Chavez sports photographer" + sport-specific long-tail keywords

### 2. Data Architecture (from DATA_ARCHITECTURE_STRATEGY.md)
- **DO NOT re-enrich 20K photos** (saves $350, 90% compatible)
- **DO add sport taxonomy** to Supabase (sport_type, photo_category, action_type)
- **DO enhance enrichment** for new photos (2-phase sport detection)
- **DO infer sport** from existing data via SQL (80-90% accuracy)

### 3. SEO Priority (from Design Agency Audit)
- **Week 1 = SEO Week** (individual photo URLs, meta tags, sitemap, structured data)
- **Without SEO, the gallery doesn't exist** (Google can't index, users can't share)
- Target: 20K+ indexed URLs within 30 days

### 4. UX Philosophy (from UX_UI_APPROACH.md)
- **"Simplicity First, AI Second"** - Progressive disclosure of advanced features
- **24 photos per page** (not 1000+)
- **Search-first interface** (always visible)
- **"Would my mom understand this?"** test

---

## 🚀 EXECUTION SEQUENCE (4 Weeks)

### CRITICAL PATH DEPENDENCIES

```
Week 1: Foundation (SEO + Schema)
  ↓ Enables sharing and discoverability
Week 2: Discovery (Search + Filtering)
  ↓ Requires sport_type from Week 1
Week 3: Content (Stories + About)
  ↓ Requires photo URLs from Week 1
Week 4: Optimization (Performance + Launch)
  ↓ Polishes everything built in Weeks 1-3
```

**Start with:** Week 1, Day 1 - Database Schema Migration
**Why:** Foundation for both SEO and multi-sport filtering

---

## WEEK 1: FOUNDATION (Schema + SEO)

**Goal:** Make gallery discoverable and enable multi-sport filtering

**Success Criteria:**
- [ ] Supabase has sport_type, photo_category, action_type columns
- [ ] 90%+ photos have sport classification
- [ ] Every photo has a shareable URL (/photo/[id])
- [ ] Open Graph previews work on Twitter/Facebook/Slack
- [ ] Sitemap with 20K+ URLs submitted to Google

---

### Day 1: Database Schema Migration (START HERE)

**Morning: Backup & Preparation**

```bash
# 1. Backup current Supabase database
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/database/backups
# Click "Create Backup" → name it "pre-multi-sport-migration"

# 2. Document current schema (safety check)
npx supabase db dump --schema public > schema_backup_$(date +%Y%m%d).sql

# 3. Count current photos
npx supabase db psql -c "SELECT COUNT(*) FROM photo_metadata;"
# Expected: ~20,000
```

**Afternoon: Add New Columns**

```sql
-- File: supabase/migrations/add_sport_taxonomy.sql

-- Step 1: Add columns (non-breaking, nullable)
ALTER TABLE photo_metadata
ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS photo_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS action_type VARCHAR(100);

-- Step 2: Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_sport_type ON photo_metadata(sport_type);
CREATE INDEX IF NOT EXISTS idx_photo_category ON photo_metadata(photo_category);
CREATE INDEX IF NOT EXISTS idx_action_type ON photo_metadata(action_type);
CREATE INDEX IF NOT EXISTS idx_sport_quality ON photo_metadata(sport_type, quality_score DESC);

-- Step 3: Verify migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_metadata'
  AND column_name IN ('sport_type', 'photo_category', 'action_type');
```

**Run Migration:**

```bash
# Apply to Supabase
# Option A: Via Supabase Dashboard
# Copy SQL above → paste in SQL Editor → Run

# Option B: Via CLI (if configured)
npx supabase db push

# Verify
npx supabase db psql -c "SELECT COUNT(*) FROM photo_metadata WHERE sport_type IS NULL;"
# Expected: ~20,000 (all null, ready for inference)
```

**End of Day 1 Checklist:**
- [ ] Backup created
- [ ] New columns added (sport_type, photo_category, action_type)
- [ ] Indexes created
- [ ] Zero data loss (COUNT(*) unchanged)
- [ ] Rollback plan documented

---

### Day 2: Data Inference (Backfill Sport Taxonomy)

**Morning: Sport Type Inference**

```sql
-- File: supabase/migrations/infer_sport_taxonomy.sql

-- STEP 1: Infer sport_type from play_type (volleyball-specific actions)
UPDATE photo_metadata
SET sport_type = 'volleyball'
WHERE play_type IN ('attack', 'block', 'dig', 'set', 'serve', 'pass')
  AND sport_type IS NULL;

-- STEP 2: Infer from keywords array
UPDATE photo_metadata
SET sport_type = CASE
  WHEN keywords @> ARRAY['volleyball'] THEN 'volleyball'
  WHEN keywords @> ARRAY['basketball'] THEN 'basketball'
  WHEN keywords @> ARRAY['soccer'] THEN 'soccer'
  WHEN keywords @> ARRAY['football'] THEN 'football'
  WHEN keywords @> ARRAY['baseball'] THEN 'baseball'
  WHEN keywords @> ARRAY['track'] THEN 'track'
  WHEN keywords @> ARRAY['portrait'] OR keywords @> ARRAY['senior'] THEN 'portrait'
  WHEN keywords @> ARRAY['candid'] THEN 'candid'
  ELSE sport_type
END
WHERE sport_type IS NULL;

-- STEP 3: Infer from album_name
UPDATE photo_metadata
SET sport_type = CASE
  WHEN album_name ILIKE '%volleyball%' THEN 'volleyball'
  WHEN album_name ILIKE '%basketball%' THEN 'basketball'
  WHEN album_name ILIKE '%soccer%' THEN 'soccer'
  WHEN album_name ILIKE '%portrait%' OR album_name ILIKE '%senior%' THEN 'portrait'
  ELSE sport_type
END
WHERE sport_type IS NULL;

-- STEP 4: Default remaining to volleyball (safe for your dataset)
UPDATE photo_metadata
SET sport_type = 'volleyball'
WHERE sport_type IS NULL;

-- VERIFY: Check distribution
SELECT sport_type, COUNT(*) as count
FROM photo_metadata
GROUP BY sport_type
ORDER BY count DESC;

-- Expected output:
-- volleyball | 14000+
-- portrait   | 2000+
-- basketball | 1500+
-- soccer     | 800+
-- other      | 1700+
```

**Afternoon: Photo Category Inference**

```sql
-- STEP 1: Classify by action_intensity + play_type
UPDATE photo_metadata
SET photo_category = CASE
  -- High intensity sports action
  WHEN action_intensity IN ('high', 'peak') AND play_type IS NOT NULL
    THEN 'action'

  -- Celebrations
  WHEN play_type = 'celebration' OR emotion = 'triumph'
    THEN 'celebration'

  -- Candid moments (low intensity or timeout)
  WHEN action_intensity = 'low' OR play_type = 'timeout'
    THEN 'candid'

  -- Portraits (from keywords)
  WHEN keywords @> ARRAY['portrait'] OR keywords @> ARRAY['senior'] OR keywords @> ARRAY['headshot']
    THEN 'portrait'

  -- Warmup/practice
  WHEN title ILIKE '%warmup%' OR title ILIKE '%practice%' OR album_name ILIKE '%warmup%'
    THEN 'warmup'

  -- Medium/high intensity defaults to action
  WHEN action_intensity IN ('medium', 'high', 'peak')
    THEN 'action'

  -- Everything else is candid
  ELSE 'candid'
END
WHERE photo_category IS NULL;

-- STEP 2: Map action_type (sport-specific actions)
UPDATE photo_metadata
SET action_type = CASE
  -- Volleyball actions
  WHEN sport_type = 'volleyball' AND play_type IS NOT NULL
    THEN play_type

  -- Non-action photos
  WHEN photo_category IN ('portrait', 'candid', 'ceremony')
    THEN NULL

  -- Keep existing play_type for manual review later
  ELSE play_type
END
WHERE action_type IS NULL;

-- VERIFY: Check photo_category distribution
SELECT photo_category, COUNT(*) as count
FROM photo_metadata
GROUP BY photo_category
ORDER BY count DESC;

-- VERIFY: Check action_type for volleyball
SELECT action_type, COUNT(*) as count
FROM photo_metadata
WHERE sport_type = 'volleyball'
GROUP BY action_type
ORDER BY count DESC;
```

**End of Day 2 Checklist:**
- [ ] sport_type populated for 100% of photos
- [ ] photo_category populated for 100% of photos
- [ ] action_type populated (null for portraits/candid)
- [ ] Verify counts match expectations
- [ ] Export "unknown" photos for manual review

---

### Day 3: Individual Photo URLs + Meta Tags

**Morning: Create Photo Detail Route**

```bash
# Create route structure
mkdir -p src/routes/photo/\[id\]
touch src/routes/photo/\[id\]/+page.svelte
touch src/routes/photo/\[id\]/+page.server.ts
```

**File: src/routes/photo/[id]/+page.server.ts**

```typescript
import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { data: photo, error: photoError } = await supabaseServer
    .from('photo_metadata')
    .select('*')
    .eq('image_key', params.id)
    .single();

  if (photoError || !photo) {
    throw error(404, 'Photo not found');
  }

  // Transform flat Supabase data to nested Photo type
  const transformedPhoto = {
    id: photo.image_key,
    image_key: photo.image_key,
    image_url: photo.ImageUrl,
    thumbnail_url: photo.ThumbnailUrl,
    original_url: photo.OriginalUrl,
    title: photo.title || 'Untitled',
    caption: photo.caption || '',
    keywords: photo.keywords || [],
    created_at: photo.photo_date || photo.enriched_at,
    metadata: {
      sharpness: photo.sharpness,
      exposure_accuracy: photo.exposure_accuracy,
      composition_score: photo.composition_score,
      emotional_impact: photo.emotional_impact,
      portfolio_worthy: photo.portfolio_worthy,
      print_ready: photo.print_ready,
      social_media_optimized: photo.social_media_optimized,
      emotion: photo.emotion,
      composition: photo.composition,
      time_of_day: photo.time_of_day,
      play_type: photo.play_type,
      action_intensity: photo.action_intensity,
      use_cases: photo.use_cases || [],
      ai_provider: photo.ai_provider,
      ai_cost: photo.ai_cost,
      enriched_at: photo.enriched_at,
      // NEW: Sport taxonomy
      sport_type: photo.sport_type,
      photo_category: photo.photo_category,
      action_type: photo.action_type,
    },
  };

  // Generate SEO meta tags
  const seoDescription = generatePhotoDescription(transformedPhoto);
  const ogImage = photo.ThumbnailUrl || photo.ImageUrl;

  return {
    photo: transformedPhoto,
    seo: {
      title: `${transformedPhoto.title} | Nino Chavez Photography`,
      description: seoDescription,
      ogImage: ogImage,
      ogType: 'article',
      canonical: `https://photography.ninochavez.co/photo/${params.id}`,
    },
  };
};

function generatePhotoDescription(photo: any): string {
  const sport = photo.metadata.sport_type || 'sports';
  const category = photo.metadata.photo_category || 'photo';
  const emotion = photo.metadata.emotion || '';
  const quality = photo.metadata.portfolio_worthy ? 'Portfolio-quality' : 'High-quality';

  return `${quality} ${sport} ${category} photo${emotion ? ` capturing ${emotion}` : ''}. ${photo.caption || 'Professional sports photography by Nino Chavez.'} Perfect for recruiting, social media, and print.`;
}
```

**File: src/routes/photo/[id]/+page.svelte**

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import PhotoDetailModal from '$lib/components/gallery/PhotoDetailModal.svelte';

  let { data } = $props();
  let showModal = $state(true);

  function handleClose() {
    // Navigate back to referring page or home
    history.back();
  }
</script>

<svelte:head>
  <title>{data.seo.title}</title>
  <meta name="description" content={data.seo.description} />
  <link rel="canonical" href={data.seo.canonical} />

  <!-- Open Graph -->
  <meta property="og:type" content={data.seo.ogType} />
  <meta property="og:url" content={data.seo.canonical} />
  <meta property="og:title" content={data.seo.title} />
  <meta property="og:description" content={data.seo.description} />
  <meta property="og:image" content={data.seo.ogImage} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.seo.title} />
  <meta name="twitter:description" content={data.seo.description} />
  <meta name="twitter:image" content={data.seo.ogImage} />

  <!-- Schema.org -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: data.photo.title,
    description: data.photo.caption,
    creator: {
      '@type': 'Person',
      name: 'Nino Chavez'
    },
    datePublished: data.photo.created_at,
    keywords: data.photo.keywords.join(', '),
    contentUrl: data.seo.canonical,
    thumbnailUrl: data.photo.thumbnail_url
  })}</script>`}
</svelte:head>

{#if showModal}
  <PhotoDetailModal photo={data.photo} onClose={handleClose} />
{/if}
```

**Afternoon: Update PhotoCard to Link to Detail**

```svelte
<!-- File: src/lib/components/gallery/PhotoCard.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Photo } from '$types/photo';
  import { Camera } from 'lucide-svelte';

  let { photo }: { photo: Photo } = $props();
  let imageLoaded = $state(false);

  function handleClick() {
    // Navigate to photo detail page
    goto(`/photo/${photo.image_key}`);
  }
</script>

<div
  class="photo-card"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
  aria-label="View photo: {photo.title}"
>
  <!-- ... existing image loading code ... -->
</div>
```

**End of Day 3 Checklist:**
- [ ] `/photo/[id]` route created
- [ ] Server-side data loading works
- [ ] SEO meta tags generated dynamically
- [ ] Open Graph preview tested (share URL in Slack)
- [ ] PhotoCard links to detail page

---

### Day 4: Sitemap + Robots.txt

**Morning: Sitemap Generation**

```typescript
// File: src/routes/sitemap.xml/+server.ts
import { supabaseServer } from '$lib/supabase/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const baseUrl = 'https://photography.ninochavez.co';

  // Fetch all photo IDs
  const { data: photos } = await supabaseServer
    .from('photo_metadata')
    .select('image_key, photo_date, portfolio_worthy, sport_type')
    .order('photo_date', { ascending: false });

  if (!photos) {
    return new Response('Error generating sitemap', { status: 500 });
  }

  const urls = [
    // Static pages
    { loc: baseUrl, priority: 1.0, changefreq: 'daily' },
    { loc: `${baseUrl}/explore`, priority: 0.9, changefreq: 'daily' },
    { loc: `${baseUrl}/collections`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${baseUrl}/albums`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: 0.7, changefreq: 'monthly' },

    // Sport-specific landing pages
    { loc: `${baseUrl}/volleyball`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${baseUrl}/portraits`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${baseUrl}/basketball`, priority: 0.7, changefreq: 'weekly' },

    // Individual photos
    ...photos.map(photo => ({
      loc: `${baseUrl}/photo/${photo.image_key}`,
      lastmod: photo.photo_date,
      priority: photo.portfolio_worthy ? 0.9 : 0.7,
      changefreq: 'monthly' as const,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600', // Cache for 1 hour
    },
  });
};
```

**Afternoon: Robots.txt + AI Metadata**

```typescript
// File: src/routes/robots.txt/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const text = `User-agent: *
Allow: /
Allow: /photo/*
Allow: /explore
Allow: /collections
Allow: /albums
Sitemap: https://photography.ninochavez.co/sitemap.xml

# AI Bot Specific Rules
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
`;

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
```

**File: static/ai-metadata.json**

```json
{
  "photographer": "Nino Chavez",
  "specialty": "Sports photography with volleyball expertise",
  "archive_size": "20,428 photos",
  "sports_covered": [
    "Volleyball (14,000+ photos)",
    "Candid sports portraits (2,400+ photos)",
    "Basketball (1,500+ photos)",
    "Soccer (800+ photos)",
    "Multi-sport action photography"
  ],
  "ai_enrichment": "12 semantic dimensions per photo including quality scores, emotion analysis, sport-specific action detection, and composition analysis",
  "unique_features": [
    "Sport-specific action type detection (volleyball: attack/block/dig, basketball: dunk/layup)",
    "Emotional impact scoring (triumph, intensity, focus, determination)",
    "AI-curated portfolio highlights across all sports",
    "Quality-stratified browsing (portfolio-worthy, print-ready, social-optimized)",
    "Multi-sport taxonomy with 80%+ classification accuracy"
  ],
  "target_audience": [
    "Parents finding their athletes' photos",
    "Athletes building recruiting portfolios",
    "Recruiters and coaches evaluating talent",
    "Sports photography enthusiasts",
    "Multi-sport families tracking seasons"
  ],
  "api_capabilities": "Natural language search across 20K+ photos by sport, event, player, emotion, action type, and quality",
  "contact": "https://photography.ninochavez.co/about"
}
```

**End of Day 4 Checklist:**
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Sitemap includes 20K+ photo URLs
- [ ] Robots.txt allows all crawlers
- [ ] AI metadata JSON published
- [ ] Test sitemap in browser (should render XML)

---

### Day 5: Google Search Console + Verification

**Morning: Submit to Search Engines**

1. **Google Search Console:**
   - Go to https://search.google.com/search-console
   - Add property: photography.ninochavez.co
   - Verify via DNS TXT record or HTML tag
   - Submit sitemap: https://photography.ninochavez.co/sitemap.xml

2. **Bing Webmaster Tools:**
   - Go to https://www.bing.com/webmasters
   - Add site
   - Submit sitemap

**Afternoon: Share Preview Testing**

```bash
# Test Open Graph preview
# Share these URLs in:
# - Slack (should show image + description)
# - Twitter (should show card)
# - Facebook (use Debug tool)

https://photography.ninochavez.co/photo/[sample-photo-id]
```

**Test URLs:**
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Debug: https://developers.facebook.com/tools/debug/
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

**End of Day 5 Checklist:**
- [ ] Google Search Console verified
- [ ] Sitemap submitted (status: "Pending")
- [ ] Bing Webmaster Tools configured
- [ ] OG preview works on 3+ platforms
- [ ] Test photo URLs shared successfully

---

## WEEK 2-4 SUMMARY (High-Level)

### Week 2: Discovery Features
- Enhanced search with autocomplete
- Sport filter UI component
- Event/album browsing
- Photo carousel in modal
- Related photos

**Why After Week 1:** Requires sport_type from database migration

---

### Week 3: Content & Storytelling
- Timeline view
- About photographer page
- Blog foundation (2 posts)
- EXIF data display
- AI story curation (optional)

**Why After Week 2:** Requires photo URLs for sharing stories

---

### Week 4: Optimization & Launch
- Performance optimization (Lighthouse 95+)
- Analytics integration
- A/B testing setup
- Final testing
- Production deployment

**Why After Week 3:** Polish and validate everything built

---

## 📊 SUCCESS METRICS

### Week 1 Success (Foundation)
- [ ] 20,000+ URLs created (/photo/[id])
- [ ] Supabase has sport_type (90%+ non-null)
- [ ] Sitemap submitted to Google (20K+ URLs)
- [ ] Share previews work (OG images load)
- [ ] Zero data loss (all original photos intact)

### 30-Day Goals
- [ ] 500+ URLs indexed in Google
- [ ] 50+ organic visitors/month
- [ ] 10+ photo shares on social media
- [ ] Sport filtering working in UI
- [ ] Lighthouse scores: 90+ across the board

### 90-Day Goals
- [ ] 10,000+ URLs indexed
- [ ] 500+ organic visitors/month
- [ ] Top 3 for "Nino Chavez photographer"
- [ ] Page 1 for 10+ long-tail keywords
- [ ] Multi-sport traffic (30% non-volleyball)

---

## 🚨 CRITICAL REMINDERS

### DO THIS (Week 1):
1. ✅ **Backup Supabase** before schema changes
2. ✅ **Test migration locally** first (if possible)
3. ✅ **Add columns as nullable** (non-breaking)
4. ✅ **Verify counts** after each SQL query
5. ✅ **Test share URLs immediately** after Day 3

### DON'T DO THIS:
1. ❌ **Re-enrich 20K photos** (waste $350)
2. ❌ **Skip SEO week** (nothing else matters without discovery)
3. ❌ **Add constraints before data is clean** (will fail)
4. ❌ **Deploy without testing share preview** (breaks social media)
5. ❌ **Work on Week 2 before Week 1 is done** (dependencies will break)

---

## 🎯 YOUR NEXT STEP (RIGHT NOW)

**START HERE:** Week 1, Day 1, Morning - Database Backup

```bash
# 1. Open Supabase Dashboard
# URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/backups

# 2. Create backup named "pre-multi-sport-migration"

# 3. Confirm current photo count
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
# Run: SELECT COUNT(*) FROM photo_metadata;
# Expected: ~20,000

# 4. Then proceed to Day 1 Afternoon (schema migration)
```

**After backup is complete:**
- Move to Day 1 Afternoon
- Run schema migration SQL
- Verify new columns added
- End of Day 1 checklist complete

---

## 📚 REFERENCE DOCUMENTS (Supporting Context)

**This document consolidates:**
1. POSITIONING_STRATEGY.md - Multi-sport positioning
2. DATA_ARCHITECTURE_STRATEGY.md - Schema and enrichment
3. UX_UI_APPROACH.md - Design philosophy
4. Design Agency Audit - Feature prioritization
5. MIGRATION_STATUS.md - Current state

**When in doubt, THIS DOCUMENT is the canonical plan.**

---

**Ready to begin? Start with Week 1, Day 1 - Database Backup.**

Let's ship this. 🚀
