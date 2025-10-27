# Week 3-4: Simple Player Tagging - Implementation Status

**Date:** 2025-10-28
**Status:** Backend Complete, Frontend Pending

---

## ✅ Completed: Backend (Week 3)

### 1. Database Migration
**File:** `database/migrations/2025-10-28-simple-player-tagging.sql`

**Created:**
- `user_tags` table with fields:
  - `id` (UUID, primary key)
  - `photo_id` (foreign key to photo_metadata)
  - `athlete_name`, `jersey_number`
  - `tagged_by_user_id`, `tagged_by_user_name`
  - `approved`, `approved_by`, `approved_at`
  - `created_at`

**Indexes:**
- `idx_user_tags_photo` - Find tags for a photo
- `idx_user_tags_pending` - Admin moderation queue
- `idx_user_tags_athlete` - Search by athlete name (approved only)
- `idx_user_tags_user` - Track user contributions

**RLS Policies:**
- Anyone can view approved tags
- Authenticated users can create tags
- Users can view their own pending tags

### 2. Public API Endpoints
**File:** `src/routes/api/tags/+server.ts`

**Endpoints:**
- `POST /api/tags` - Create new tag (authenticated)
- `GET /api/tags?photo_id={id}` - Get tags for photo (public for approved)
- `DELETE /api/tags/{id}` - Delete own pending tag

**Features:**
- Authentication via Supabase cookies
- Validates photo exists before creating tag
- RLS automatically filters approved vs. pending tags

### 3. Admin API Endpoints
**File:** `src/routes/api/admin/tags/+server.ts`

**Endpoints:**
- `GET /api/admin/tags?status=pending` - Get pending tags (with photo thumbnails)
- `POST /api/admin/tags/{id}/approve` - Approve tag
- `DELETE /api/admin/tags/{id}` - Reject/delete tag

**Features:**
- Admin authentication via Bearer token
- Uses service_role key (bypasses RLS)
- Includes photo metadata in response

---

## ⏸️ Pending: Frontend (Week 4)

### Components to Build:

#### 1. `src/lib/components/tagging/TagInput.svelte`
**Purpose:** Form to submit player tags on photo page

**Props:**
```typescript
interface Props {
  photoId: string;
}
```

**Features:**
- Text input for athlete name
- Optional jersey number input
- Submit button
- Success/error feedback
- Authentication check (show login prompt if not authenticated)

**API Call:** `POST /api/tags`

---

#### 2. `src/lib/components/tagging/TagDisplay.svelte`
**Purpose:** Display approved tags on photo page

**Props:**
```typescript
interface Props {
  photoId: string;
}
```

**Features:**
- Fetch and display approved tags
- Show badge for each athlete (name + jersey number)
- Real-time updates when tags are approved

**API Call:** `GET /api/tags?photo_id={photoId}`

---

#### 3. `src/lib/components/tagging/AdminTagQueue.svelte`
**Purpose:** Admin moderation interface

**Props:**
```typescript
interface Props {
  adminToken: string; // Admin API key
}
```

**Features:**
- List pending tags with thumbnails
- Approve button (✓)
- Reject button (✗)
- Show submitter info
- Real-time queue updates

**API Calls:**
- `GET /api/admin/tags?status=pending`
- `POST /api/admin/tags/{id}/approve`
- `DELETE /api/admin/tags/{id}`

---

#### 4. Admin Dashboard Page
**File:** `src/routes/admin/tags/+page.svelte`

**Purpose:** Admin-only page to moderate tags

**Features:**
- Protected route (admin auth)
- Embed `AdminTagQueue` component
- Simple, functional UI

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Admin API Key (for tag approval)
ADMIN_API_KEY=your-secure-admin-key-here

# Supabase (already configured)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Generate Admin Key:**
```bash
# Generate secure random key
openssl rand -base64 32
```

---

## Next Steps

### Step 1: Run Database Migration
```sql
-- Run in Supabase SQL Editor
-- Copy contents of database/migrations/2025-10-28-simple-player-tagging.sql
```

### Step 2: Set Environment Variables
```bash
# Add ADMIN_API_KEY to .env.local
echo "ADMIN_API_KEY=$(openssl rand -base64 32)" >> .env.local
```

### Step 3: Build Frontend Components (Week 4)
1. Create `TagInput.svelte`
2. Create `TagDisplay.svelte`
3. Create `AdminTagQueue.svelte`
4. Create admin dashboard page
5. Integrate into photo detail page

### Step 4: Testing Workflow
1. Submit tag as authenticated user
2. Verify tag appears in admin queue
3. Approve tag as admin
4. Verify tag appears on photo page

---

## Design Philosophy: Keep It Simple

✅ **What We Built:**
- 1 table only
- 3 simple API endpoints (public) + 2 admin endpoints
- Basic approval workflow
- No complexity

❌ **What We Didn't Build (intentionally):**
- No reputation system
- No voting/validation
- No verified contributors
- No leaderboards
- No gamification
- No auto-approval logic

**Why:** Start lean, add features only if proven valuable

---

## Success Metrics (Week 4 Completion)

- [ ] 20+ tags submitted in first week
- [ ] 80%+ tag approval rate
- [ ] <48 hour average approval time
- [ ] 5+ unique contributors
- [ ] Admin moderation <1 hour/week

---

**Status:** Backend complete, ready for frontend implementation
**Next:** Build Svelte components for Week 4
