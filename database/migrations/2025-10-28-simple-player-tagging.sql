/**
 * Database Migration: Simple Player Tagging
 *
 * Date: 2025-10-28
 * Purpose: Enable user-contributed player identification with admin approval
 *
 * Philosophy: Keep it simple
 * - 1 table only (no reputation, voting, or verified contributors)
 * - Basic approval workflow (human provides what AI can't)
 * - Admin moderation queue
 *
 * Human provides what AI can't: Player names
 */

-- ============================================
-- PHASE 1: CREATE USER_TAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Photo reference
  photo_id TEXT NOT NULL REFERENCES photo_metadata(photo_id) ON DELETE CASCADE,

  -- Player identification
  athlete_name TEXT NOT NULL,
  jersey_number TEXT,

  -- User tracking
  tagged_by_user_id TEXT NOT NULL,
  tagged_by_user_name TEXT,

  -- Approval workflow (simple)
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 2: CREATE INDEXES
-- ============================================

-- Find all tags for a photo (display on photo page)
CREATE INDEX idx_user_tags_photo ON user_tags(photo_id);

-- Admin moderation queue (pending approval)
CREATE INDEX idx_user_tags_pending ON user_tags(approved) WHERE approved = FALSE;

-- Search by athlete name (approved tags only)
CREATE INDEX idx_user_tags_athlete ON user_tags(athlete_name) WHERE approved = TRUE;

-- Track user contributions (for future features)
CREATE INDEX idx_user_tags_user ON user_tags(tagged_by_user_id);

-- ============================================
-- PHASE 3: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on user_tags table
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read APPROVED tags
CREATE POLICY "Anyone can view approved tags"
  ON user_tags
  FOR SELECT
  USING (approved = TRUE);

-- Policy 2: Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON user_tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Users can view their own pending tags
CREATE POLICY "Users can view their own tags"
  ON user_tags
  FOR SELECT
  USING (tagged_by_user_id = auth.uid()::text OR approved = TRUE);

-- Policy 4: Admins can approve/update tags (via service_role key)
-- NOTE: Admin approval will be done via service_role key, bypassing RLS

-- ============================================
-- PHASE 4: VALIDATION QUERIES
-- ============================================

-- Check table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_tags'
ORDER BY ordinal_position;

-- Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_tags'
  AND schemaname = 'public'
ORDER BY indexname;

-- Check RLS policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_tags';

-- ============================================
-- PHASE 5: TEST DATA (Optional - for development)
-- ============================================

-- Uncomment to insert test data:
/*
INSERT INTO user_tags (photo_id, athlete_name, jersey_number, tagged_by_user_id, tagged_by_user_name, approved)
VALUES
  ('test-photo-1', 'John Smith', '15', 'test-user-1', 'Test User', FALSE),
  ('test-photo-2', 'Sarah Johnson', '7', 'test-user-2', 'Test User 2', TRUE);
*/

-- ============================================
-- MIGRATION SUMMARY
-- ============================================

/*
CHANGES APPLIED:

✅ Created user_tags table with:
  - photo_id (foreign key to photo_metadata)
  - athlete_name, jersey_number
  - tagged_by_user_id, tagged_by_user_name
  - approved, approved_by, approved_at
  - created_at

✅ Created 4 indexes:
  - idx_user_tags_photo (find tags for a photo)
  - idx_user_tags_pending (admin moderation queue)
  - idx_user_tags_athlete (search by athlete name)
  - idx_user_tags_user (track user contributions)

✅ Enabled RLS with 3 policies:
  - Anyone can view approved tags
  - Authenticated users can create tags
  - Users can view their own tags

NEXT STEPS:

1. Build API endpoints:
   - POST /api/tags (create tag)
   - GET /api/tags?photo_id={id} (get tags for photo)
   - POST /api/admin/tags/{id}/approve (approve tag)
   - POST /api/admin/tags/{id}/reject (reject tag)

2. Build UI components:
   - TagInput.svelte (create tag form)
   - TagDisplay.svelte (show approved tags on photo)
   - AdminTagQueue.svelte (admin moderation interface)

3. Test workflow:
   - User submits tag
   - Tag appears in admin queue
   - Admin approves tag
   - Tag appears on photo page

ROLLBACK (if needed):

DROP TABLE IF EXISTS user_tags CASCADE;
*/
