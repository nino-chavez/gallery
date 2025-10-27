# Implementation Plan: Enhanced Enrichment & Player Tagging System

**Version:** 1.0
**Date:** 2025-10-27
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Enhanced Enrichment (v3.0)](#phase-1-enhanced-enrichment-v30)
4. [Phase 2: Player Tagging System](#phase-2-player-tagging-system)
5. [Phase 3: Reputation & Trust System](#phase-3-reputation--trust-system)
6. [Phase 4: Verified Contributors Program](#phase-4-verified-contributors-program)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [UI/UX Flows](#uiux-flows)
10. [Testing Strategy](#testing-strategy)
11. [Deployment & Rollout](#deployment--rollout)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

### Goals

Build a comprehensive photo metadata system that combines:
1. **AI-powered enrichment** - Automated extraction of visual, contextual, and technical metadata
2. **Human-powered tagging** - User-contributed player identification with quality controls
3. **Trust system** - Reputation-based auto-approval to reduce moderation burden
4. **Verified contributors** - Invite-only program for high-quality, instant tags

### Value Proposition

- **AI excels at:** Visual analysis, technical metrics, pattern recognition
- **Humans excel at:** Player identification, event context, memorable moments
- **Combined strength:** Comprehensive, accurate metadata powering advanced features

### Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | 2 weeks | v3.0 enrichment deployed, 20K photos processed |
| Phase 2 | 3 weeks | Player tagging system live with approval queue |
| Phase 3 | 1 week | Reputation system deployed |
| Phase 4 | 1 week | Verified contributors program launched |
| **Total** | **7 weeks** | **Full system operational** |

### Investment

- **AI Enrichment:** $200 (one-time, 20K photos)
- **Development:** ~160 hours (4 weeks @ 40hrs/week)
- **Ongoing Moderation:** 1-2 hours/week (decreases over time)
- **Total:** $200 + development time

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Photo Metadata System                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│  AI Enrichment   │                      │  User Tagging    │
│     Pipeline     │                      │     System       │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           │
        ▼                                           ▼
┌──────────────────┐                      ┌──────────────────┐
│ photo_metadata   │◄────────────────────►│  athlete_tags    │
│   (main table)   │                      │                  │
└──────────────────┘                      └──────────────────┘
        │                                           │
        │                                           ▼
        │                                  ┌──────────────────┐
        │                                  │ user_reputation  │
        │                                  │                  │
        │                                  └──────────────────┘
        │                                           │
        │                                           ▼
        │                                  ┌──────────────────┐
        │                                  │   verified_      │
        │                                  │  contributors    │
        │                                  └──────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│               Admin Dashboard (Moderation UI)                │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ AI Verification │  │  Tag Approval    │  │ Reputation │ │
│  │     Queue       │  │     Queue        │  │ Management │ │
│  └─────────────────┘  └──────────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. AI ENRICHMENT FLOW
   Photo Upload → Gemini Vision API → JSON Response → Parse & Validate
   → Store to photo_metadata → Flag low confidence → Admin review queue

2. USER TAGGING FLOW
   User Tags Player → Validate Input → Check Reputation → Store athlete_tag
   → Approval Queue (if needed) → Admin Approves → Link to photo_metadata
   → Update User Reputation

3. VERIFIED CONTRIBUTOR FLOW
   Verified User Tags → Auto-approve → Instant Publish → Link to photo
   → Skip Approval Queue
```

---

## Phase 1: Enhanced Enrichment (v3.0)

### 1.1 Database Migration

**File:** `database/migrations/2025-10-27-schema-v3-comprehensive-enrichment.sql`

**Columns Added:** 17 new columns
- Advanced search: `embedding`, `dominant_colors`, `player_count`, `venue_type`
- Auto-tagging: `detected_jersey_numbers`, `visible_branding`
- Story context: `crowd_intensity`, `score_visible`, `team_dynamics`
- Composition: `main_subject_bbox`
- Admin workflow: `human_verified`, `verified_at`, `verified_by`, `human_corrections`, `needs_review`, `review_priority`, `review_notes`

**Indexes Created:** 5 strategic indexes
```sql
idx_photo_player_count
idx_photo_venue_type
idx_photo_verified
idx_photo_review_queue
idx_photo_context_similarity
```

**Triggers Created:**
```sql
trigger_flag_low_confidence
  -- Auto-flags photos with ai_confidence < 0.7 for review
```

### 1.2 Enrichment Pipeline

**File:** `scripts/backfill-schema-v3-comprehensive.ts`

**Process:**
1. Fetch photo from database (ThumbnailUrl for speed)
2. Convert to base64
3. Call Gemini 2.0 Flash with comprehensive prompt
4. Parse JSON response (extract from markdown if needed)
5. Validate response structure (all 3 buckets present)
6. Map to database columns
7. Update photo_metadata
8. Trigger auto-flags low confidence
9. Track progress & cost

**Configuration:**
```typescript
const BATCH_SIZE = 50;              // Process 50 photos at a time
const RATE_LIMIT_DELAY_MS = 1000;   // 1 second between API calls
const DRY_RUN = false;              // Set true for testing
const TEST_LIMIT = undefined;       // Set to 10 for testing
```

### 1.3 Testing Protocol

**Step 1: Schema Migration**
```bash
# Connect to Supabase SQL Editor
# Run: database/migrations/2025-10-27-schema-v3-comprehensive-enrichment.sql
# Verify: All 17 columns added, indexes created, trigger active
```

**Step 2: Test on 10 Photos**
```bash
bash scripts/test-comprehensive-extraction.sh
```

**Validation Checklist:**
- [ ] JSON response is valid (no parsing errors)
- [ ] All 3 buckets extracted (bucket1, bucket2, bucket3)
- [ ] dominant_colors has exactly 5 colors
- [ ] dominant_colors percentages sum to 100
- [ ] main_subject_bbox coordinates are 0-1 normalized
- [ ] player_count is reasonable (1-12)
- [ ] venue_type is one of expected values
- [ ] ai_confidence is 0-1 float
- [ ] Low confidence photos flagged (needs_review = TRUE)
- [ ] Cost tracking accurate (~$0.01 per photo)

**Step 3: Manual Review of Results**
```sql
-- Check extracted data quality
SELECT
  photo_id,
  lighting,
  dominant_colors,
  player_count,
  detected_jersey_numbers,
  venue_type,
  crowd_intensity,
  ai_confidence,
  needs_review,
  review_priority
FROM photo_metadata
WHERE album_key = '5dvLQR'
  AND lighting IS NOT NULL
ORDER BY ai_confidence DESC
LIMIT 10;
```

**Acceptance Criteria:**
- [ ] 90%+ success rate (9/10 photos extracted)
- [ ] dominant_colors look visually accurate
- [ ] player_count matches visual inspection
- [ ] venue_type is correct
- [ ] ai_confidence scores are reasonable (0.5-0.9 range)

### 1.4 Full Backfill Execution

**Preparation:**
```bash
# Ensure .env.local has required keys
VITE_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_API_KEY=...

# Check API quota remaining
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY"
```

**Launch:**
```bash
# Run backfill (no test limits)
npx tsx scripts/backfill-schema-v3-comprehensive.ts

# Or with logging
npx tsx scripts/backfill-schema-v3-comprehensive.ts 2>&1 | tee /tmp/full-backfill-v3.log
```

**Monitoring:**
- Progress printed every 10 photos
- Expected: ~15.7 photos/min (based on previous test)
- Duration: ~21 hours for 20,000 photos
- Cost: ~$200

**Checkpoints:**
- [ ] Hour 1: 1,000 photos processed (~$10 spent)
- [ ] Hour 6: 6,000 photos processed (~$60 spent)
- [ ] Hour 12: 12,000 photos processed (~$120 spent)
- [ ] Hour 21: 20,000 photos processed (~$200 spent)

### 1.5 Validation Queries

**After completion:**
```sql
-- Count enriched photos
SELECT COUNT(*) FROM photo_metadata WHERE lighting IS NOT NULL;
-- Expected: ~20,000

-- Check distribution of venue types
SELECT venue_type, COUNT(*) as count
FROM photo_metadata
WHERE venue_type IS NOT NULL
GROUP BY venue_type
ORDER BY count DESC;

-- Check review queue size
SELECT needs_review, COUNT(*) as count
FROM photo_metadata
GROUP BY needs_review;
-- Expected: 2,000-4,000 flagged for review (10-20%)

-- Check confidence distribution
SELECT
  CASE
    WHEN ai_confidence >= 0.9 THEN 'Very High (0.9-1.0)'
    WHEN ai_confidence >= 0.7 THEN 'High (0.7-0.9)'
    WHEN ai_confidence >= 0.5 THEN 'Medium (0.5-0.7)'
    ELSE 'Low (0.0-0.5)'
  END as confidence_level,
  COUNT(*) as count
FROM photo_metadata
WHERE ai_confidence IS NOT NULL
GROUP BY confidence_level
ORDER BY confidence_level;
```

### 1.6 Rollback Plan

**If extraction fails or produces bad data:**

```sql
-- Full rollback
DROP TABLE IF EXISTS photo_metadata;
ALTER TABLE photo_metadata_backup_v3_20251027 RENAME TO photo_metadata;

-- Partial rollback (keep some data, reset v3 fields only)
UPDATE photo_metadata SET
  dominant_colors = NULL,
  main_subject_bbox = NULL,
  player_count = NULL,
  detected_jersey_numbers = NULL,
  venue_type = NULL,
  visible_branding = NULL,
  crowd_intensity = NULL,
  score_visible = NULL,
  team_dynamics = NULL,
  human_verified = FALSE,
  needs_review = FALSE,
  review_priority = 0;
```

### 1.7 Phase 1 Deliverables

- [x] Schema v3.0 migration file
- [x] Comprehensive enrichment prompts
- [x] Backfill script with test mode
- [x] Test wrapper script
- [ ] 20,000 photos enriched with comprehensive metadata
- [ ] Validation report
- [ ] Admin review queue populated

---

## Phase 2: Player Tagging System

### 2.1 Database Schema

**File:** `database/migrations/2025-10-28-player-tagging-system.sql`

```sql
-- ============================================
-- ATHLETE TAGS (User-contributed player IDs)
-- ============================================

CREATE TABLE athlete_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Photo relationship
  photo_id TEXT NOT NULL REFERENCES photo_metadata(photo_id) ON DELETE CASCADE,

  -- Player identification
  athlete_name TEXT NOT NULL,           -- Normalized name
  jersey_number TEXT,                   -- Links to detected_jersey_numbers
  team_name TEXT,
  position TEXT,                        -- "setter", "outside", "middle", "libero"

  -- User contribution tracking
  raw_input TEXT NOT NULL,              -- What user actually typed
  tagged_by_user_id TEXT NOT NULL,
  tagged_by_user_name TEXT,
  source TEXT NOT NULL DEFAULT 'user_tagged'
    CHECK (source IN ('ai_detected', 'user_tagged', 'admin_verified')),

  -- Quality metrics
  confidence_score FLOAT DEFAULT 0.5,   -- Increases with votes
  votes INT DEFAULT 1,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,

  -- Moderation
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejected BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_athlete_tags_photo ON athlete_tags(photo_id);
CREATE INDEX idx_athlete_tags_approval ON athlete_tags(approved, created_at DESC);
CREATE INDEX idx_athlete_tags_user ON athlete_tags(tagged_by_user_id);
CREATE INDEX idx_athlete_tags_athlete ON athlete_tags(athlete_name);
CREATE INDEX idx_athlete_tags_pending ON athlete_tags(approved) WHERE approved = FALSE;

-- Prevent duplicate tags from same user on same photo
CREATE UNIQUE INDEX idx_athlete_tags_unique
  ON athlete_tags(photo_id, athlete_name, tagged_by_user_id);

-- ============================================
-- ATHLETES DIRECTORY (Normalized)
-- ============================================

CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  full_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  jersey_number TEXT,
  team_name TEXT,
  position TEXT,

  -- Profile
  bio TEXT,
  profile_image_url TEXT,
  social_links JSON,                    -- {instagram, twitter, etc.}

  -- Statistics (auto-computed)
  total_photos INT DEFAULT 0,
  total_tags INT DEFAULT 0,
  verified_tags INT DEFAULT 0,

  -- Verification
  verified BOOLEAN DEFAULT FALSE,       -- Verified athlete (owns this profile)
  verified_at TIMESTAMP,
  verified_by TEXT,

  -- Status
  active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_athletes_name ON athletes(full_name);
CREATE INDEX idx_athletes_team ON athletes(team_name);
CREATE INDEX idx_athletes_verified ON athletes(verified) WHERE verified = TRUE;

-- ============================================
-- TAG VOTES (Community validation)
-- ============================================

CREATE TABLE athlete_tag_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES athlete_tags(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP DEFAULT NOW(),

  -- One vote per user per tag
  UNIQUE(tag_id, user_id)
);

CREATE INDEX idx_tag_votes_tag ON athlete_tag_votes(tag_id);
CREATE INDEX idx_tag_votes_user ON athlete_tag_votes(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update tag confidence score based on votes
CREATE OR REPLACE FUNCTION update_tag_confidence()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate confidence: (upvotes + 1) / (total_votes + 2)
  -- Bayesian average with prior of 1 upvote, 1 downvote
  NEW.confidence_score := (NEW.upvotes + 1.0) / (NEW.votes + 2.0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_confidence
  BEFORE INSERT OR UPDATE OF upvotes, downvotes, votes
  ON athlete_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_confidence();

-- Update athlete stats when tag is approved
CREATE OR REPLACE FUNCTION update_athlete_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    UPDATE athletes
    SET
      verified_tags = verified_tags + 1,
      total_photos = (
        SELECT COUNT(DISTINCT photo_id)
        FROM athlete_tags
        WHERE athlete_name = NEW.athlete_name AND approved = TRUE
      ),
      updated_at = NOW()
    WHERE full_name = NEW.athlete_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_athlete_stats
  AFTER UPDATE OF approved
  ON athlete_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_stats();
```

### 2.2 API Endpoints

**File:** `src/routes/api/athlete-tags/+server.ts`

#### POST `/api/athlete-tags` - Create New Tag

**Request:**
```typescript
{
  photo_id: string;
  athlete_name: string;     // User's input
  jersey_number?: string;   // Optional, links to AI detection
  team_name?: string;
  position?: string;
}
```

**Response:**
```typescript
{
  success: true,
  tag: {
    id: string;
    photo_id: string;
    athlete_name: string;
    status: 'pending_approval' | 'auto_approved';
    requires_approval: boolean;
  }
}
```

**Business Logic:**
1. Authenticate user (required)
2. Validate input (athlete_name not empty)
3. Check if athlete exists in `athletes` table
   - If not, suggest similar names (fuzzy match)
   - Prompt user to confirm or create new athlete
4. Check user reputation:
   - If reputation_score >= 0.8 → auto-approve
   - If verified_contributor → auto-approve
   - Otherwise → requires approval
5. Create `athlete_tag` record
6. Update `user_tag_reputation` (increment total_tags)
7. Return response

#### GET `/api/athlete-tags?photo_id={id}` - Get Tags for Photo

**Response:**
```typescript
{
  tags: [
    {
      id: string;
      athlete_name: string;
      jersey_number: string;
      confidence_score: number;
      votes: number;
      approved: boolean;
      tagged_by: string;
    }
  ]
}
```

#### POST `/api/athlete-tags/{id}/vote` - Vote on Tag

**Request:**
```typescript
{
  vote_type: 'upvote' | 'downvote';
}
```

**Business Logic:**
1. Authenticate user
2. Check if user already voted on this tag
3. Create/update vote in `athlete_tag_votes`
4. Update vote counts on `athlete_tags`
5. Trigger confidence score recalculation
6. If confidence crosses threshold (>0.75) → auto-approve

#### GET `/api/athletes?search={query}` - Search Athletes

**Response:**
```typescript
{
  athletes: [
    {
      id: string;
      full_name: string;
      display_name: string;
      jersey_number: string;
      team_name: string;
      total_photos: number;
      verified: boolean;
    }
  ]
}
```

**Business Logic:**
1. Fuzzy search on `full_name`, `display_name`
2. Return top 10 matches
3. Prioritize verified athletes

### 2.3 Admin API Endpoints

**File:** `src/routes/api/admin/athlete-tags/+server.ts`

#### GET `/api/admin/athlete-tags?status=pending` - Get Approval Queue

**Response:**
```typescript
{
  tags: [
    {
      id: string;
      photo: {
        id: string;
        url: string;
        detected_jersey_numbers: string[];
      },
      athlete_name: string;
      jersey_number: string;
      tagged_by: {
        user_id: string;
        username: string;
        reputation_score: number;
      },
      confidence_score: number;
      votes: number;
      created_at: string;
    }
  ],
  total: number;
}
```

#### POST `/api/admin/athlete-tags/{id}/approve` - Approve Tag

**Business Logic:**
1. Set `approved = TRUE`
2. Set `approved_by = admin_user_id`
3. Set `approved_at = NOW()`
4. Update user reputation (increment approved_tags)
5. If athlete doesn't exist in `athletes` table → create entry
6. Trigger athlete stats update
7. Check if user qualifies for auto-approve (10+ approved tags)

#### POST `/api/admin/athlete-tags/{id}/reject` - Reject Tag

**Request:**
```typescript
{
  reason: string;  // Why rejected
}
```

**Business Logic:**
1. Set `rejected = TRUE`
2. Set `rejection_reason`
3. Update user reputation (increment rejected_tags)
4. Check if user should lose auto-approve privilege
5. Optionally notify user

#### POST `/api/admin/athlete-tags/batch-approve` - Batch Approve

**Request:**
```typescript
{
  tag_ids: string[];
}
```

**Business Logic:**
- Same as individual approve, but in transaction
- Useful for approving multiple tags from same user

### 2.4 UI Components

#### Component: `PlayerTagInput.svelte`

**Location:** `src/lib/components/tagging/PlayerTagInput.svelte`

**Props:**
```typescript
interface Props {
  photoId: string;
  detectedJerseyNumbers?: string[];
  existingTags?: AthleteTag[];
}
```

**Features:**
- Autocomplete search of athletes directory
- Shows AI-detected jersey numbers
- "Add new athlete" flow if not found
- Real-time validation
- Shows existing tags with vote buttons

**UI Flow:**
```
1. User clicks "Tag a player"
2. Input field appears with autocomplete
3. As user types, show matching athletes:
   ┌─────────────────────────────────┐
   │ Sarah Johnson (#12)             │  [Verified ✓]
   │ Team: Beach Elite               │
   │ 234 photos                      │
   ├─────────────────────────────────┤
   │ Sarah Jones (#7)                │
   │ Team: Wave Riders               │
   │ 56 photos                       │
   ├─────────────────────────────────┤
   │ + Add new athlete "sarah jo..." │
   └─────────────────────────────────┘

4. User selects athlete or creates new
5. If new athlete:
   ┌─────────────────────────────────┐
   │ Add New Athlete                 │
   ├─────────────────────────────────┤
   │ Full Name: [Sarah Johnson    ] │
   │ Jersey #:  [12               ] │
   │ Team:      [Beach Elite      ] │
   │ Position:  [Outside Hitter  ▼] │
   ├─────────────────────────────────┤
   │         [Cancel]  [Add Player]  │
   └─────────────────────────────────┘

6. Submit → Shows status:
   - "Tag submitted for approval" (pending)
   - "Tag added!" (auto-approved)
```

#### Component: `PhotoTags.svelte`

**Location:** `src/lib/components/tagging/PhotoTags.svelte`

**Displays:**
- Approved tags (visible to all)
- Pending tags (visible to tagger + admin)
- Vote buttons (for logged-in users)

**Layout:**
```
┌─────────────────────────────────────┐
│ Sarah Johnson (#12) ✓               │
│ 8 votes · Tagged by @athletesfriend │
│ [👍 Upvote] [👎 Downvote]            │
├─────────────────────────────────────┤
│ Emma Chen (#7) ⏳                   │
│ Pending approval                    │
└─────────────────────────────────────┘
```

#### Component: `TagApprovalQueue.svelte`

**Location:** `src/lib/components/admin/TagApprovalQueue.svelte`

**Admin Dashboard Component:**
```
┌──────────────────────────────────────────────────┐
│ Tag Approval Queue (24 pending)                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Photo Thumbnail]                               │
│                                                  │
│  Tagged as: Sarah Johnson (#12)                 │
│  By: @volleyballfan (reputation: 0.65)          │
│  Confidence: 0.72 · 3 upvotes, 0 downvotes      │
│                                                  │
│  AI Detection: Jersey numbers [12, 7] visible   │
│  Venue: indoor_gym · 2 players in frame         │
│                                                  │
│  [✓ Approve] [✗ Reject] [→ Skip]                │
│                                                  │
├──────────────────────────────────────────────────┤
│ [Load More]                           Page 1/3  │
└──────────────────────────────────────────────────┘
```

**Features:**
- Shows photo for context
- Displays AI-detected info (jersey numbers, player count)
- Shows tagger reputation
- Batch actions (Approve all from this user)
- Keyboard shortcuts (A=approve, R=reject, S=skip)

### 2.5 Phase 2 Deliverables

- [ ] Database migration for player tagging
- [ ] API endpoints (create, get, vote, approve, reject)
- [ ] PlayerTagInput component
- [ ] PhotoTags display component
- [ ] TagApprovalQueue admin component
- [ ] Integration tests
- [ ] Documentation

---

## Phase 3: Reputation & Trust System

### 3.1 Database Schema

**File:** `database/migrations/2025-10-29-reputation-system.sql`

```sql
-- ============================================
-- USER REPUTATION TRACKING
-- ============================================

CREATE TABLE user_tag_reputation (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,

  -- Tagging statistics
  total_tags INT DEFAULT 0,
  approved_tags INT DEFAULT 0,
  rejected_tags INT DEFAULT 0,
  pending_tags INT DEFAULT 0,

  -- Vote statistics
  upvotes_received INT DEFAULT 0,
  downvotes_received INT DEFAULT 0,
  votes_given INT DEFAULT 0,

  -- Computed reputation score (0-1)
  reputation_score FLOAT DEFAULT 0.0,

  -- Trust level
  trust_level TEXT DEFAULT 'new'
    CHECK (trust_level IN ('new', 'learning', 'trusted', 'expert')),
  auto_approve BOOLEAN DEFAULT FALSE,

  -- Activity
  first_tag_at TIMESTAMP,
  last_tag_at TIMESTAMP,
  streak_days INT DEFAULT 0,

  -- Admin overrides
  manually_promoted BOOLEAN DEFAULT FALSE,
  manually_demoted BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reputation_score ON user_tag_reputation(reputation_score DESC);
CREATE INDEX idx_reputation_trust ON user_tag_reputation(trust_level);
CREATE INDEX idx_reputation_auto_approve ON user_tag_reputation(auto_approve)
  WHERE auto_approve = TRUE;

-- ============================================
-- REPUTATION EVENTS LOG
-- ============================================

CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user_tag_reputation(user_id),
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'tag_submitted',
      'tag_approved',
      'tag_rejected',
      'upvote_received',
      'downvote_received',
      'trust_level_upgraded',
      'trust_level_downgraded',
      'auto_approve_granted',
      'auto_approve_revoked',
      'admin_override'
    )),
  points_delta FLOAT NOT NULL,           -- Change to reputation score
  old_score FLOAT,
  new_score FLOAT,
  old_trust_level TEXT,
  new_trust_level TEXT,
  metadata JSON,                         -- Event-specific data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reputation_events_user ON reputation_events(user_id, created_at DESC);
CREATE INDEX idx_reputation_events_type ON reputation_events(event_type);

-- ============================================
-- REPUTATION CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_reputation_score(
  p_approved INT,
  p_rejected INT,
  p_upvotes INT,
  p_downvotes INT
)
RETURNS FLOAT AS $$
DECLARE
  approval_rate FLOAT;
  vote_ratio FLOAT;
  total_actions INT;
  reputation FLOAT;
BEGIN
  total_actions := p_approved + p_rejected;

  -- Avoid division by zero
  IF total_actions = 0 THEN
    RETURN 0.5;  -- Neutral score for new users
  END IF;

  -- Approval rate (weighted 70%)
  approval_rate := p_approved::FLOAT / total_actions;

  -- Vote ratio (weighted 30%)
  IF (p_upvotes + p_downvotes) = 0 THEN
    vote_ratio := 0.5;
  ELSE
    vote_ratio := p_upvotes::FLOAT / (p_upvotes + p_downvotes);
  END IF;

  -- Combined score
  reputation := (approval_rate * 0.7) + (vote_ratio * 0.3);

  -- Bonus for volume (up to +0.1)
  IF total_actions >= 50 THEN
    reputation := LEAST(1.0, reputation + 0.1);
  ELSIF total_actions >= 20 THEN
    reputation := LEAST(1.0, reputation + 0.05);
  END IF;

  RETURN reputation;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRUST LEVEL DETERMINATION
-- ============================================

CREATE OR REPLACE FUNCTION determine_trust_level(
  p_reputation FLOAT,
  p_total_tags INT
)
RETURNS TEXT AS $$
BEGIN
  -- Expert: 0.9+ reputation, 50+ tags
  IF p_reputation >= 0.9 AND p_total_tags >= 50 THEN
    RETURN 'expert';

  -- Trusted: 0.8+ reputation, 10+ tags
  ELSIF p_reputation >= 0.8 AND p_total_tags >= 10 THEN
    RETURN 'trusted';

  -- Learning: 0.6+ reputation, 3+ tags
  ELSIF p_reputation >= 0.6 AND p_total_tags >= 3 THEN
    RETURN 'learning';

  -- New: Everyone else
  ELSE
    RETURN 'new';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update Reputation on Tag Events
-- ============================================

CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
  old_score FLOAT;
  new_score FLOAT;
  old_trust TEXT;
  new_trust TEXT;
  points_delta FLOAT;
BEGIN
  -- Get current reputation
  SELECT reputation_score, trust_level INTO old_score, old_trust
  FROM user_tag_reputation
  WHERE user_id = NEW.tagged_by_user_id;

  -- Recalculate based on event
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    -- Tag approved
    UPDATE user_tag_reputation
    SET
      approved_tags = approved_tags + 1,
      pending_tags = pending_tags - 1,
      last_tag_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.tagged_by_user_id;

    points_delta := 0.02;  -- Small boost for approval

  ELSIF NEW.rejected = TRUE AND OLD.rejected = FALSE THEN
    -- Tag rejected
    UPDATE user_tag_reputation
    SET
      rejected_tags = rejected_tags + 1,
      pending_tags = pending_tags - 1,
      updated_at = NOW()
    WHERE user_id = NEW.tagged_by_user_id;

    points_delta := -0.05;  -- Penalty for rejection
  END IF;

  -- Recalculate reputation score
  UPDATE user_tag_reputation
  SET reputation_score = calculate_reputation_score(
    approved_tags,
    rejected_tags,
    upvotes_received,
    downvotes_received
  )
  WHERE user_id = NEW.tagged_by_user_id
  RETURNING reputation_score, trust_level INTO new_score, new_trust;

  -- Update trust level
  new_trust := determine_trust_level(new_score,
    (SELECT total_tags FROM user_tag_reputation WHERE user_id = NEW.tagged_by_user_id)
  );

  UPDATE user_tag_reputation
  SET
    trust_level = new_trust,
    auto_approve = CASE
      WHEN new_trust IN ('trusted', 'expert') THEN TRUE
      ELSE FALSE
    END
  WHERE user_id = NEW.tagged_by_user_id;

  -- Log reputation event
  INSERT INTO reputation_events (
    user_id,
    event_type,
    points_delta,
    old_score,
    new_score,
    old_trust_level,
    new_trust_level,
    metadata
  ) VALUES (
    NEW.tagged_by_user_id,
    CASE
      WHEN NEW.approved = TRUE THEN 'tag_approved'
      WHEN NEW.rejected = TRUE THEN 'tag_rejected'
      ELSE 'tag_submitted'
    END,
    points_delta,
    old_score,
    new_score,
    old_trust,
    new_trust,
    jsonb_build_object(
      'tag_id', NEW.id,
      'photo_id', NEW.photo_id,
      'athlete_name', NEW.athlete_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_reputation
  AFTER UPDATE OF approved, rejected
  ON athlete_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create reputation entry when user makes first tag
CREATE OR REPLACE FUNCTION create_reputation_on_first_tag()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_tag_reputation (
    user_id,
    username,
    total_tags,
    pending_tags,
    first_tag_at,
    last_tag_at
  ) VALUES (
    NEW.tagged_by_user_id,
    NEW.tagged_by_user_name,
    1,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_tags = user_tag_reputation.total_tags + 1,
    pending_tags = user_tag_reputation.pending_tags + 1,
    last_tag_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_reputation_on_first_tag
  AFTER INSERT ON athlete_tags
  FOR EACH ROW
  EXECUTE FUNCTION create_reputation_on_first_tag();
```

### 3.2 Reputation Badges & UI

**Trust Level Badges:**

```typescript
const TRUST_BADGES = {
  new: {
    label: 'New Contributor',
    icon: '🌱',
    color: 'gray',
    description: 'Just getting started',
  },
  learning: {
    label: 'Learning',
    icon: '📚',
    color: 'blue',
    description: '3+ approved tags',
  },
  trusted: {
    label: 'Trusted Contributor',
    icon: '⭐',
    color: 'yellow',
    description: '10+ approved tags, auto-approved',
  },
  expert: {
    label: 'Expert Tagger',
    icon: '👑',
    color: 'purple',
    description: '50+ approved tags, highly accurate',
  },
};
```

**User Profile Display:**

```
┌─────────────────────────────────────┐
│ @volleyballfan                      │
│ ⭐ Trusted Contributor              │
├─────────────────────────────────────┤
│ Reputation: 0.87 / 1.00             │
│ [████████████████████░░░░] 87%     │
├─────────────────────────────────────┤
│ 24 tags approved                    │
│ 2 tags pending                      │
│ 1 tag rejected                      │
│ 87% approval rate                   │
├─────────────────────────────────────┤
│ 🎯 Auto-approve enabled             │
│ 🔥 7-day streak                     │
└─────────────────────────────────────┘
```

### 3.3 Reputation Progression Path

| Level | Requirements | Benefits |
|-------|-------------|----------|
| **New** | 0 tags | Tags require approval |
| **Learning** | 3+ approved, 0.6+ score | Shown as "learning" badge |
| **Trusted** | 10+ approved, 0.8+ score | **Auto-approve enabled** |
| **Expert** | 50+ approved, 0.9+ score | Featured contributor, can vote to auto-approve others |

**Progression Example:**
```
Day 1:  Submit 3 tags → Pending
Day 2:  Admin approves 3 → Learning badge (0.7 score)
Week 1: Submit 10 more tags → 12 approved, 1 rejected → 0.82 score
Week 2: Trusted badge unlocked! → Auto-approve enabled
Month 3: 55 approved tags, 0.91 score → Expert badge
```

### 3.4 Gamification Features

**Achievements:**
```typescript
const ACHIEVEMENTS = [
  {
    id: 'first_tag',
    name: 'First Tag',
    description: 'Submit your first player tag',
    icon: '🎯',
  },
  {
    id: 'trusted_contributor',
    name: 'Trusted Contributor',
    description: 'Reach Trusted status',
    icon: '⭐',
  },
  {
    id: 'expert_tagger',
    name: 'Expert Tagger',
    description: 'Reach Expert status',
    icon: '👑',
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Tag photos for 7 days in a row',
    icon: '🔥',
  },
  {
    id: 'team_tagger',
    name: 'Team Tagger',
    description: 'Tag all players from a complete team',
    icon: '🏐',
  },
];
```

**Leaderboard:**
```
┌─────────────────────────────────────┐
│ Top Contributors This Month         │
├─────────────────────────────────────┤
│ 1. 👑 @athletesfriend  (143 tags)   │
│ 2. ⭐ @volleyballmom   (89 tags)    │
│ 3. ⭐ @coachsmith      (67 tags)    │
│ 4. 📚 @newbie          (12 tags)    │
└─────────────────────────────────────┘
```

### 3.5 Phase 3 Deliverables

- [ ] Reputation system database schema
- [ ] Reputation calculation functions
- [ ] User profile component with reputation display
- [ ] Badges and trust level UI
- [ ] Achievements system
- [ ] Leaderboard component
- [ ] Admin tools for manual reputation adjustment

---

## Phase 4: Verified Contributors Program

### 4.1 Database Schema

**File:** `database/migrations/2025-10-30-verified-contributors.sql`

```sql
-- ============================================
-- VERIFIED CONTRIBUTORS (Invite-Only)
-- ============================================

CREATE TABLE verified_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL REFERENCES user_tag_reputation(user_id),

  -- Identity
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Role & affiliation
  role TEXT NOT NULL
    CHECK (role IN ('athlete', 'coach', 'official', 'photographer', 'team_manager')),
  team_affiliation TEXT,
  organization TEXT,

  -- Permissions
  can_tag BOOLEAN DEFAULT TRUE,
  can_verify_others BOOLEAN DEFAULT FALSE,
  auto_approve BOOLEAN DEFAULT TRUE,
  can_tag_types TEXT[] DEFAULT ARRAY['player', 'event']::TEXT[],

  -- Invitation
  invited_by TEXT NOT NULL,
  invited_at TIMESTAMP DEFAULT NOW(),
  invitation_code TEXT UNIQUE,
  accepted_at TIMESTAMP,

  -- Status
  active BOOLEAN DEFAULT TRUE,
  suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,

  -- Profile
  bio TEXT,
  profile_image_url TEXT,
  social_links JSON,

  -- Statistics
  total_tags INT DEFAULT 0,
  total_verified INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_verified_contributors_user ON verified_contributors(user_id);
CREATE INDEX idx_verified_contributors_role ON verified_contributors(role);
CREATE INDEX idx_verified_contributors_active ON verified_contributors(active)
  WHERE active = TRUE;

-- ============================================
-- VERIFICATION INVITATIONS
-- ============================================

CREATE TABLE contributor_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  invited_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by_user_id TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

  -- Metadata
  invitation_message TEXT,
  metadata JSON
);

CREATE INDEX idx_invitations_code ON contributor_invitations(invitation_code);
CREATE INDEX idx_invitations_email ON contributor_invitations(email);
CREATE INDEX idx_invitations_status ON contributor_invitations(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VC-' || upper(substring(md5(random()::text) from 1 for 12));
END;
$$ LANGUAGE plpgsql;

-- Check if user is verified contributor
CREATE OR REPLACE FUNCTION is_verified_contributor(p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM verified_contributors
    WHERE user_id = p_user_id AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Invitation Flow

**Step 1: Admin Creates Invitation**
```typescript
// POST /api/admin/contributors/invite
{
  email: "sarah.johnson@volleyball.com",
  role: "athlete",
  team_affiliation: "Beach Elite",
  invitation_message: "Hi Sarah! We'd love for you to help tag photos from the AVP tournament."
}

// Response
{
  invitation_code: "VC-A3F9D2E1B4C7",
  invitation_url: "https://photography.ninochavez.co/invite/VC-A3F9D2E1B4C7",
  expires_at: "2025-11-27T00:00:00Z"
}
```

**Step 2: Email Sent to Invitee**
```
Subject: You're invited to become a Verified Contributor!

Hi Sarah,

Nino has invited you to become a Verified Contributor to his volleyball
photography gallery.

As a Verified Contributor, you can:
✓ Tag players in photos instantly (no approval needed)
✓ Help identify teammates and opponents
✓ Add context to tournament photos

Your invitation code: VC-A3F9D2E1B4C7

Accept invitation: https://photography.ninochavez.co/invite/VC-A3F9D2E1B4C7

This invitation expires in 30 days.
```

**Step 3: User Accepts Invitation**
```
┌─────────────────────────────────────────────┐
│ Verified Contributor Invitation             │
├─────────────────────────────────────────────┤
│ You've been invited by Nino Chavez          │
│                                             │
│ Role: Athlete                               │
│ Team: Beach Elite                           │
│                                             │
│ As a Verified Contributor, you can:         │
│ ✓ Tag players instantly                     │
│ ✓ Add event context                         │
│ ✓ Help build the gallery community          │
│                                             │
│ [Sign In to Accept] [Decline]              │
└─────────────────────────────────────────────┘
```

**Step 4: Account Linked**
- User signs in (or creates account)
- Invitation code validated
- User promoted to `verified_contributors`
- Auto-approve enabled automatically
- Welcome email sent with instructions

### 4.3 Verified Contributor UI

**Badge Display:**
```
┌─────────────────────────────────────┐
│ @sarahjohnson                       │
│ ✓ Verified Athlete                  │
│ Beach Elite • #12                   │
├─────────────────────────────────────┤
│ 🎯 Auto-approve enabled             │
│ 156 players tagged                  │
└─────────────────────────────────────┘
```

**Special Features:**
- Instant publish (no approval queue)
- Can suggest other verified contributors
- Featured in "Verified Contributors" page
- Special badge on all tags

### 4.4 Admin Management

**Verified Contributors Dashboard:**
```
┌──────────────────────────────────────────────────────────┐
│ Verified Contributors (12 active)                        │
├──────────────────────────────────────────────────────────┤
│ Search: [________________] [+ Invite New]                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ✓ Sarah Johnson (@sarahjohnson)                         │
│   Athlete • Beach Elite • 156 tags                      │
│   [View Profile] [Suspend] [Remove]                     │
│                                                          │
│ ✓ Mike Chen (@coachchen)                                │
│   Coach • Wave Riders • 89 tags                         │
│   [View Profile] [Suspend] [Remove]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Pending Invitations (3)                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ emma.chen@volleyball.com • Athlete                       │
│ Invited 5 days ago • Expires in 25 days                 │
│ [Resend] [Revoke]                                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Phase 4 Deliverables

- [ ] Verified contributors database schema
- [ ] Invitation system (create, send, accept)
- [ ] Email templates for invitations
- [ ] Verified badge UI components
- [ ] Admin management dashboard
- [ ] Public "Verified Contributors" page
- [ ] Documentation for onboarding new contributors

---

## Database Schema

### Complete Entity-Relationship Diagram

```
photo_metadata (main table)
├─ photo_id (PK)
├─ Bucket 1: User-facing filters
│  ├─ play_type, action_intensity, sport_type
│  ├─ composition, time_of_day
│  ├─ lighting, color_temperature (v3.0)
│  └─ venue_type, player_count (v3.0)
├─ Bucket 2: Internal AI
│  ├─ emotion, sharpness, composition_score
│  ├─ exposure_accuracy, emotional_impact
│  ├─ time_in_game, ai_confidence (v3.0)
│  └─ crowd_intensity, team_dynamics (v3.0)
├─ Bucket 3: Advanced features (v3.0)
│  ├─ dominant_colors (JSON)
│  ├─ main_subject_bbox (JSON)
│  ├─ detected_jersey_numbers (TEXT[])
│  └─ visible_branding (TEXT[])
└─ Admin workflow (v3.0)
   ├─ human_verified, verified_at, verified_by
   ├─ human_corrections (JSON)
   └─ needs_review, review_priority, review_notes

athlete_tags (user contributions)
├─ id (PK)
├─ photo_id (FK → photo_metadata)
├─ athlete_name, jersey_number, team_name
├─ tagged_by_user_id (FK → user_tag_reputation)
├─ confidence_score, votes, upvotes, downvotes
├─ approved, rejected
└─ timestamps

athletes (normalized directory)
├─ id (PK)
├─ full_name, display_name, jersey_number
├─ team_name, position
├─ total_photos, verified_tags
├─ verified (athlete owns profile)
└─ profile info

athlete_tag_votes (community validation)
├─ id (PK)
├─ tag_id (FK → athlete_tags)
├─ user_id
└─ vote_type (upvote/downvote)

user_tag_reputation (trust system)
├─ user_id (PK)
├─ total_tags, approved_tags, rejected_tags
├─ upvotes_received, downvotes_received
├─ reputation_score (0-1)
├─ trust_level (new/learning/trusted/expert)
├─ auto_approve
└─ activity stats

reputation_events (audit log)
├─ id (PK)
├─ user_id (FK → user_tag_reputation)
├─ event_type, points_delta
├─ old_score, new_score
└─ old_trust_level, new_trust_level

verified_contributors (invite-only)
├─ id (PK)
├─ user_id (FK → user_tag_reputation)
├─ role, team_affiliation
├─ auto_approve (always TRUE)
├─ can_verify_others
└─ invitation info

contributor_invitations (invitation flow)
├─ id (PK)
├─ email, invitation_code
├─ role, invited_by
├─ expires_at, accepted_at
└─ status
```

---

## API Design

### Public API Endpoints

#### Photo Endpoints
```
GET    /api/photos                    # List photos
GET    /api/photos/{id}               # Get photo details
GET    /api/photos/{id}/tags          # Get player tags for photo
GET    /api/photos/search             # Search photos (filters, tags)
```

#### Athlete Endpoints
```
GET    /api/athletes                  # List athletes
GET    /api/athletes/search?q={name}  # Search athletes (autocomplete)
GET    /api/athletes/{id}             # Get athlete profile
GET    /api/athletes/{id}/photos      # Get photos tagged with athlete
```

#### Tagging Endpoints
```
POST   /api/athlete-tags              # Create new tag (auth required)
GET    /api/athlete-tags/{id}         # Get tag details
POST   /api/athlete-tags/{id}/vote    # Vote on tag (auth required)
DELETE /api/athlete-tags/{id}         # Delete own tag (auth required)
```

#### User Endpoints
```
GET    /api/users/{id}/reputation     # Get user reputation
GET    /api/users/{id}/tags           # Get user's tags
GET    /api/users/{id}/achievements   # Get achievements
GET    /api/leaderboard               # Get top contributors
```

### Admin API Endpoints

#### Moderation
```
GET    /api/admin/athlete-tags?status=pending  # Get approval queue
POST   /api/admin/athlete-tags/{id}/approve    # Approve tag
POST   /api/admin/athlete-tags/{id}/reject     # Reject tag
POST   /api/admin/athlete-tags/batch-approve   # Batch approve
```

#### AI Verification
```
GET    /api/admin/ai-review-queue              # Photos needing review
POST   /api/admin/photos/{id}/verify           # Verify AI extraction
POST   /api/admin/photos/{id}/correct          # Correct AI mistakes
```

#### Reputation Management
```
GET    /api/admin/users                        # List users
GET    /api/admin/users/{id}                   # Get user details
POST   /api/admin/users/{id}/promote           # Manual promotion
POST   /api/admin/users/{id}/demote            # Manual demotion
POST   /api/admin/users/{id}/suspend           # Suspend user
```

#### Verified Contributors
```
GET    /api/admin/contributors                 # List verified contributors
POST   /api/admin/contributors/invite          # Create invitation
DELETE /api/admin/contributors/{id}            # Remove contributor
GET    /api/admin/invitations                  # List invitations
POST   /api/admin/invitations/{id}/resend     # Resend invitation
DELETE /api/admin/invitations/{id}            # Revoke invitation
```

---

## UI/UX Flows

### Flow 1: User Tags a Player (First Time)

```
1. User views photo detail page
   ├─ Sees "Tag players in this photo" button
   └─ Clicks button

2. Tag input appears
   ├─ User types "sarah"
   ├─ Autocomplete shows matching athletes
   │  ├─ Sarah Johnson (#12) - Beach Elite
   │  ├─ Sarah Jones (#7) - Wave Riders
   │  └─ + Add new athlete "sarah"
   └─ User selects "Sarah Johnson"

3. Confirmation modal
   ├─ Shows photo with highlight around selected player
   ├─ Confirms: "Tag this as Sarah Johnson (#12)?"
   ├─ Optional: Add jersey number if visible
   └─ User clicks "Confirm"

4. Tag submitted
   ├─ If user is new/learning:
   │  └─ "Tag submitted for approval! We'll review it soon."
   ├─ If user is trusted/expert:
   │  └─ "Tag added! ✓"
   └─ If user is verified contributor:
      └─ "Tag published! ✓"

5. Tag appears on photo
   ├─ Shows pending badge (⏳) if awaiting approval
   ├─ Shows checkmark (✓) if approved
   └─ Other users can upvote/downvote
```

### Flow 2: Admin Approves Tags

```
1. Admin opens dashboard
   ├─ Sees "24 tags awaiting approval" notification
   └─ Clicks "Tag Approval Queue"

2. Approval queue loads
   ├─ First tag shown:
   │  ├─ Photo thumbnail
   │  ├─ Tagged as: "Sarah Johnson (#12)"
   │  ├─ By: @volleyballfan (reputation: 0.65)
   │  ├─ AI detected: [12, 7] jersey numbers
   │  └─ Confidence: 0.72 • 3 upvotes
   └─ Admin reviews

3. Admin makes decision
   ├─ Option A: Click "✓ Approve"
   │  ├─ Tag approved instantly
   │  ├─ User reputation increases
   │  ├─ Tag shows on photo
   │  └─ Next tag loads
   ├─ Option B: Click "✗ Reject"
   │  ├─ Rejection reason modal opens
   │  ├─ Admin enters reason
   │  ├─ User reputation decreases
   │  ├─ User notified of rejection
   │  └─ Next tag loads
   └─ Option C: Click "→ Skip"
      └─ Saves for later, loads next tag

4. Batch actions (optional)
   ├─ "Approve all from @volleyballfan" (if trusted)
   └─ "Reject all from @spammer"
```

### Flow 3: Verified Contributor Workflow

```
1. Verified contributor views photo
   ├─ Sees "Quick Tag" button (special for verified)
   └─ Clicks button

2. Streamlined tag input
   ├─ Autocomplete with recent teammates pre-loaded
   ├─ "Recent: Sarah Johnson, Emma Chen, Lisa Park"
   └─ User selects from recent or searches

3. Instant publish
   ├─ Tag added immediately (no approval)
   ├─ Shows "✓ Verified" badge on tag
   └─ Photo searchable by player name instantly

4. Special permissions
   ├─ Can edit/delete own tags
   ├─ Can suggest corrections to other tags
   └─ Can nominate others for verification
```

---

## Testing Strategy

### Unit Tests

**Database Functions:**
```typescript
// src/lib/supabase/reputation.test.ts
describe('calculate_reputation_score', () => {
  test('new user starts at 0.5', () => {
    expect(calculateReputationScore(0, 0, 0, 0)).toBe(0.5);
  });

  test('perfect record gives 1.0', () => {
    expect(calculateReputationScore(50, 0, 100, 0)).toBeCloseTo(1.0);
  });

  test('50% approval gives 0.35', () => {
    expect(calculateReputationScore(5, 5, 0, 0)).toBeCloseTo(0.35);
  });
});
```

**API Endpoints:**
```typescript
// src/routes/api/athlete-tags/+server.test.ts
describe('POST /api/athlete-tags', () => {
  test('creates tag for authenticated user', async () => {
    const response = await fetch('/api/athlete-tags', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        photo_id: 'abc123',
        athlete_name: 'Sarah Johnson',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.tag.status).toBe('pending_approval');
  });

  test('auto-approves for trusted user', async () => {
    // User with reputation 0.85
    const response = await createTag(trustedUserToken);
    const data = await response.json();
    expect(data.tag.status).toBe('auto_approved');
  });
});
```

### Integration Tests

**Full Tag Workflow:**
```typescript
// tests/integration/tagging-workflow.test.ts
describe('Complete tagging workflow', () => {
  test('user tags → admin approves → reputation updates', async () => {
    // 1. User creates tag
    const tag = await createTag(newUserToken, {
      photo_id: 'photo1',
      athlete_name: 'Sarah Johnson',
    });

    expect(tag.approved).toBe(false);

    // 2. Admin approves
    await approveTag(adminToken, tag.id);

    // 3. Check tag is now approved
    const updatedTag = await getTag(tag.id);
    expect(updatedTag.approved).toBe(true);

    // 4. Check reputation increased
    const reputation = await getUserReputation(newUserId);
    expect(reputation.approved_tags).toBe(1);
    expect(reputation.reputation_score).toBeGreaterThan(0.5);
  });
});
```

### E2E Tests (Playwright)

**User Tagging Journey:**
```typescript
// tests/e2e/player-tagging.spec.ts
test('user can tag a player', async ({ page, context }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to photo
  await page.goto('/photo/abc123');

  // Click tag button
  await page.click('text=Tag players');

  // Type athlete name
  await page.fill('[placeholder="Search athletes..."]', 'sarah');

  // Wait for autocomplete
  await page.waitForSelector('text=Sarah Johnson');

  // Select athlete
  await page.click('text=Sarah Johnson (#12)');

  // Confirm
  await page.click('text=Confirm');

  // Verify tag submitted message
  await expect(page.locator('text=Tag submitted for approval')).toBeVisible();

  // Verify tag appears as pending
  await expect(page.locator('text=Sarah Johnson ⏳')).toBeVisible();
});
```

**Admin Approval Journey:**
```typescript
test('admin can approve tags', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page);

  // Navigate to approval queue
  await page.goto('/admin/tags/pending');

  // Verify queue shows pending tag
  await expect(page.locator('text=Sarah Johnson (#12)')).toBeVisible();

  // Approve tag
  await page.click('button:has-text("✓ Approve")');

  // Verify success message
  await expect(page.locator('text=Tag approved')).toBeVisible();

  // Verify tag removed from queue
  await expect(page.locator('text=Sarah Johnson (#12)')).not.toBeVisible();
});
```

---

## Deployment & Rollout

### Pre-Deployment Checklist

#### Phase 1: Enhanced Enrichment
- [ ] Schema v3.0 migration tested on staging
- [ ] Backup verified (can restore if needed)
- [ ] Test run completed successfully (10 photos)
- [ ] Cost estimates confirmed
- [ ] API quota verified (20K+ requests available)
- [ ] Monitoring alerts configured

#### Phase 2: Player Tagging
- [ ] Database schema migrated
- [ ] API endpoints deployed
- [ ] UI components tested
- [ ] Email templates configured (approval notifications)
- [ ] Admin dashboard tested
- [ ] Documentation published

#### Phase 3: Reputation System
- [ ] Reputation calculation functions tested
- [ ] Triggers active and working
- [ ] Badge system tested
- [ ] Leaderboard functional
- [ ] Analytics tracking configured

#### Phase 4: Verified Contributors
- [ ] Invitation system tested
- [ ] Email templates configured (invitations)
- [ ] Badge UI components ready
- [ ] Admin management tools tested
- [ ] Initial invitations drafted

### Rollout Timeline

#### Week 1-2: Enhanced Enrichment
- **Day 1:** Run schema migration on production
- **Day 2:** Test extraction on 10 photos
- **Day 3:** Launch full backfill (overnight)
- **Day 4-5:** Monitor progress, validate results
- **Day 6-7:** Build admin review queue UI
- **Deliverable:** 20K photos enriched with comprehensive metadata

#### Week 3-5: Player Tagging System
- **Week 3:** Backend (schema, API, triggers)
  - Day 1-2: Database migration
  - Day 3-5: API endpoints & testing
- **Week 4:** Frontend (UI components)
  - Day 1-3: PlayerTagInput component
  - Day 4-5: PhotoTags display, approval queue
- **Week 5:** Integration & testing
  - Day 1-3: E2E testing
  - Day 4: Soft launch (invite 5 beta users)
  - Day 5: Collect feedback, iterate
- **Deliverable:** Player tagging live with approval queue

#### Week 6: Reputation System
- **Day 1-2:** Deploy reputation schema & functions
- **Day 3-4:** Build reputation UI (badges, profile)
- **Day 5:** Launch achievements & leaderboard
- **Deliverable:** Reputation system active, first users reaching "Trusted"

#### Week 7: Verified Contributors
- **Day 1-2:** Deploy verified contributor schema
- **Day 3:** Build invitation system
- **Day 4:** Draft initial invitations (athletes, coaches)
- **Day 5:** Send first batch of invitations
- **Deliverable:** Verified contributor program launched

### Monitoring & Metrics

#### Dashboard Metrics to Track

**AI Enrichment:**
- Total photos enriched
- Average ai_confidence score
- Photos flagged for review
- Cost per photo (actual vs. estimated)
- Processing rate (photos/min)

**Player Tagging:**
- Total tags submitted
- Tags pending approval
- Tags approved/rejected (daily)
- Average approval time
- Tag accuracy rate (corrected tags / total tags)

**Reputation System:**
- Users by trust level (new/learning/trusted/expert)
- Auto-approve enabled users
- Average reputation score
- Reputation distribution histogram

**Verified Contributors:**
- Total verified contributors
- Contributors by role
- Average tags per contributor
- Invitation acceptance rate

#### Alerts to Configure

```yaml
alerts:
  # AI Enrichment
  - name: high_failure_rate
    condition: success_rate < 0.85
    action: notify_admin

  - name: low_confidence_spike
    condition: needs_review_count > 5000
    action: notify_admin

  # Player Tagging
  - name: approval_queue_backlog
    condition: pending_tags > 100
    action: notify_admin

  - name: high_rejection_rate
    condition: rejection_rate > 0.3
    action: notify_admin

  # Reputation System
  - name: reputation_exploit
    condition: reputation_score_change > 0.5 in 1 hour
    action: flag_for_review

  # System Health
  - name: api_error_rate
    condition: error_rate > 0.05
    action: notify_ops_team
```

---

## Success Metrics

### Phase 1: Enhanced Enrichment

**Quantitative:**
- [ ] 95%+ photos successfully enriched (19,000+ / 20,000)
- [ ] Average ai_confidence > 0.75
- [ ] <20% photos flagged for review (<4,000)
- [ ] Cost within budget ($200 ± $20)
- [ ] Processing time <24 hours

**Qualitative:**
- [ ] Extracted metadata visually accurate (spot-check 50 photos)
- [ ] New filters functional in UI (venue, player count)
- [ ] Admin review queue manageable (<2 hours/week)

### Phase 2: Player Tagging System

**Quantitative:**
- [ ] 100+ tags submitted in first week
- [ ] >80% tag approval rate
- [ ] <24 hour average approval time
- [ ] <5% spam/invalid tags

**Qualitative:**
- [ ] User feedback positive (survey NPS > 7)
- [ ] Athletes enthusiastic about tagging
- [ ] Admin moderation time reasonable (<2 hours/week)

### Phase 3: Reputation System

**Quantitative:**
- [ ] 10+ users reach "Trusted" status
- [ ] 50%+ of tags auto-approved (from trusted users)
- [ ] <10% reputation disputes
- [ ] Admin moderation time reduced by 40%

**Qualitative:**
- [ ] Users understand progression path
- [ ] Badges motivate participation
- [ ] No gaming/exploitation of system

### Phase 4: Verified Contributors

**Quantitative:**
- [ ] 20+ verified contributors invited
- [ ] 70%+ invitation acceptance rate
- [ ] 500+ tags from verified contributors
- [ ] 99%+ accuracy from verified tags

**Qualitative:**
- [ ] Athletes feel valued/engaged
- [ ] High-quality tags with context
- [ ] Community forming around gallery

### Long-Term Success (6 months)

**Engagement:**
- [ ] 500+ unique taggers
- [ ] 5,000+ player tags total
- [ ] 50+ verified contributors
- [ ] 80%+ photos have at least one player tag

**Quality:**
- [ ] 90%+ tag accuracy
- [ ] Average reputation score > 0.7
- [ ] <5% tags rejected
- [ ] <1 hour/week admin moderation time

**Features Enabled:**
- [ ] "Player Highlight Reels" functional
- [ ] "Find Similar" feature accurate
- [ ] Color-based search popular
- [ ] Story collections enhanced

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI enrichment fails | Low | High | Test on 10 photos first, have rollback plan |
| Schema migration breaks site | Low | Critical | Run on staging first, create backup |
| API rate limits hit | Medium | Medium | Monitor quota, implement exponential backoff |
| Database performance degraded | Low | Medium | Add strategic indexes, monitor query times |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low user engagement (tagging) | Medium | Medium | Invite athletes first, gamification, clear value prop |
| Tag quality issues | Medium | Medium | Approval queue, reputation system, verified contributors |
| Moderation burden too high | Medium | High | Auto-approve for trusted users, batch tools |
| Privacy concerns (athlete tagging) | Low | High | Approval queue, athletes can request removal |
| Gaming reputation system | Low | Medium | Admin oversight, manual adjustments, vote verification |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cost overruns ($200 → $400) | Low | Low | Test on 10 photos, monitor costs real-time |
| Backfill takes >24 hours | Medium | Low | Run overnight, auto-resume on failure |
| Admin burnout | Medium | High | Auto-approve system, verified contributors, reasonable goals |

---

## Appendix A: Environment Variables

```bash
# AI Enrichment
GOOGLE_API_KEY=                     # Gemini 2.0 Flash API key
VITE_SUPABASE_URL=                  # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=          # Service role (bypasses RLS)

# Email (for invitations, notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=

# Authentication
AUTH_SECRET=                        # Session secret
GITHUB_CLIENT_ID=                   # OAuth (optional)
GITHUB_CLIENT_SECRET=

# Feature Flags
ENABLE_PLAYER_TAGGING=true
ENABLE_REPUTATION_SYSTEM=true
ENABLE_VERIFIED_CONTRIBUTORS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000         # 1 minute
RATE_LIMIT_MAX_REQUESTS=100        # 100 requests per minute
```

---

## Appendix B: Database Sizing Estimates

### Storage Requirements

```
photo_metadata (existing: 20,000 rows)
├─ New v3.0 columns per row:
│  ├─ dominant_colors (JSON): ~150 bytes
│  ├─ main_subject_bbox (JSON): ~50 bytes
│  ├─ detected_jersey_numbers (TEXT[]): ~20 bytes
│  ├─ visible_branding (TEXT[]): ~50 bytes
│  └─ Other fields: ~50 bytes
├─ Total new data per row: ~320 bytes
└─ Total new data: 20,000 × 320 = ~6.4 MB

athlete_tags (estimated: 10,000 tags in year 1)
├─ Per tag: ~500 bytes
└─ Total: 10,000 × 500 = ~5 MB

athletes (estimated: 500 athletes)
├─ Per athlete: ~300 bytes
└─ Total: 500 × 300 = ~150 KB

user_tag_reputation (estimated: 200 users)
├─ Per user: ~200 bytes
└─ Total: 200 × 200 = ~40 KB

reputation_events (estimated: 20,000 events)
├─ Per event: ~300 bytes
└─ Total: 20,000 × 300 = ~6 MB

verified_contributors (estimated: 50 contributors)
├─ Per contributor: ~400 bytes
└─ Total: 50 × 400 = ~20 KB

TOTAL ADDITIONAL STORAGE: ~18 MB
```

**Conclusion:** Storage impact negligible for Supabase free tier (500 MB limit).

### Query Performance Estimates

```sql
-- Player search (with autocomplete)
-- Expected: <50ms
EXPLAIN ANALYZE
SELECT * FROM athletes
WHERE full_name ILIKE 'sarah%'
LIMIT 10;

-- Tag approval queue
-- Expected: <100ms
EXPLAIN ANALYZE
SELECT * FROM athlete_tags
WHERE approved = FALSE
ORDER BY created_at DESC
LIMIT 50;

-- Photo with tags
-- Expected: <100ms
EXPLAIN ANALYZE
SELECT
  p.*,
  json_agg(t.*) as tags
FROM photo_metadata p
LEFT JOIN athlete_tags t ON t.photo_id = p.photo_id
WHERE p.photo_id = 'abc123'
GROUP BY p.photo_id;

-- Reputation leaderboard
-- Expected: <200ms
EXPLAIN ANALYZE
SELECT * FROM user_tag_reputation
ORDER BY reputation_score DESC
LIMIT 50;
```

---

## Appendix C: Reference Documents

### Related Documentation

1. **Schema v3.0 Plan:** `.agent-os/schema-v3-comprehensive-enrichment-plan.md`
2. **Enrichment Prompts:** `src/lib/ai/enrichment-prompts-v3.ts`
3. **Backfill Script:** `scripts/backfill-schema-v3-comprehensive.ts`
4. **Database Migrations:** `database/migrations/`

### External Resources

1. **Gemini API Docs:** https://ai.google.dev/docs
2. **Supabase Docs:** https://supabase.com/docs
3. **SvelteKit Docs:** https://kit.svelte.dev/docs
4. **Playwright Testing:** https://playwright.dev/docs/intro

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
**Status:** Ready for Implementation

**Next Actions:**
1. Review this plan with stakeholders
2. Run Phase 1 (Enhanced Enrichment)
3. Begin Phase 2 development (Player Tagging)
