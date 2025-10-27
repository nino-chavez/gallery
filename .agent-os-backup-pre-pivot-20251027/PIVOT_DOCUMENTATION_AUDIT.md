# Documentation Audit for UX Pivot

**Date:** 2025-10-27
**Purpose:** Identify which documentation to keep, remove, or revise for the new Information Architecture and Metadata Model pivot

---

## Executive Summary

### The Pivot

**Old Approach (Emotion-First Discovery):**
- Information Architecture: Undefined hierarchy, emotion-driven navigation
- Metadata Model: Abstract tags (emotion, quality_score) as primary filters
- Problem: "If I'm always forced to filter by a second dimension, is the first dimension useful?"

**New Approach (Story-First Utility):**
- **Information Architecture:** 4 clear modes
  - **Browse:** Traditional album-first view (SmugMug-like)
  - **Explore:** AI-driven dynamic feed (Instagram-like) with innovative features
  - **Search:** Advanced NLP search for action-based queries
  - **Collections:** Thematic AI collections + user favorites
- **Metadata Model:** Concrete utility over abstract tags
  - ❌ Stop asking: "What emotion?" "What quality?"
  - ✅ Start asking: "What Story?" "What Action?" "What Aesthetic?"

### Recommendation

**Remove:** 113 files (83% of documentation)
**Keep:** 23 files (17% of documentation)
**Net Result:** Clean slate focused on implementation patterns, not outdated product vision

---

## Category 1: REMOVE - Product Definition (Old Vision)

### Files to Delete

#### `.agent-os/product/` (All 7 files)

| File | Reason for Removal |
|------|-------------------|
| `mission.md` | Entire mission is based on "emotion-first discovery" and "quality stratification". New pivot is story-first with concrete actions. |
| `design-brief.md` | 570 lines focused on "Emotion Halos", "Quality Glow", "Emotion Ambience", "Magnetic Filter Orbs". All tied to old metadata model. |
| `roadmap.md` | All 4 phases (22 deliverables) are based on old IA: "3D Emotion Galaxy", "Emotion Timeline Scrubber", "Contextual Cursor showing emotion". Completely obsolete. |
| `tech-stack.md` | If exists, likely references old feature set. Verify and remove if product-specific. |
| `IMPLEMENTATION_STATUS.md` | Tracks progress on old roadmap. No longer relevant. |
| `VERIFICATION_RESULTS.md` | Results for old specs. |
| `VERIFICATION_PLAN.md` | Plan for old specs. |

**Why Remove:**
These documents define the "Living Archive" as an emotion-centric, quality-stratified experience. The new vision is fundamentally different:
- Old: "Emotion-first discovery with AI semantic intelligence"
- New: "Story-first discovery with action-based search"

The old metadata model (emotion, quality_score as primary dimensions) is the core problem you identified. Keeping these docs will cause confusion and drift.

---

## Category 2: REMOVE - Feature Specs (Outdated Implementations)

### Files to Delete

#### `.agent-os/specs/` (All 6 spec directories, ~106 files)

| Spec Directory | Deliverables | Reason for Removal |
|----------------|--------------|-------------------|
| `2025-10-15-uiux-design-system/` | Phase 1-4 implementation (23 files) | Based on "Emotion Halos", "3D Photo Physics", "Magnetic Orbs" |
| `2025-10-15-browse-route/` | Old browse implementation | Doesn't match new "traditional album-first SmugMug view" |
| `2025-10-16-stories-route/` | Old story viewer | Based on emotion timeline, not action/story model |
| `2025-10-16-badges-route/` | Gamification feature | Not in new 4-mode IA |
| `2025-10-16-portfolio-route/` | Old portfolio view | Quality-stratified approach obsolete |
| `2025-10-16-innovation-implementation/` | "Emotion Navigation", "Magnetic Orbs" | All emotion-driven features |
| `2025-10-17-living-archive-v2-foundation/` | Foundation for old vision | |

**Total:** ~106 markdown files including:
- Planning docs (requirements.md, initialization.md)
- Task lists (tasks.md, tasks-phase2.md)
- Implementation plans (*-implementation.md)
- Verification reports (spec-verification.md, frontend-verification.md, etc.)

**Why Remove:**
Every spec implements features from the old roadmap. Examples:
- "Magnetic Filter Orbs" assume emotion is a primary filter
- "Quality-Stratified Grid" assumes quality_score drives UI
- "Emotion Timeline Scrubber" assumes emotion arcs are the narrative structure
- "3D Emotion Galaxy" is the signature feature of the OLD vision

The new IA requires completely different features:
- **Browse:** Simple album listing + photo grid (doesn't exist in old specs)
- **Explore:** Dynamic Instagram-feed (not the emotion-driven gallery)
- **Search:** NLP action search ("show me blocks") not emotion search
- **Collections:** Story-based collections, not emotion clusters

---

## Category 3: KEEP - Implementation-Agnostic Standards

### Files to Preserve

#### `.agent-os/standards/` (Keep all 6 files)

| File | Why Keep |
|------|----------|
| `frontend/components.md` | General component best practices (single responsibility, reusability, composability). Not tied to old model. |
| `frontend/css.md` | CSS naming conventions, organization. Implementation-agnostic. |
| `frontend/responsive.md` | Responsive design breakpoints, mobile-first approach. Universal principles. |
| `frontend/accessibility.md` | WCAG compliance, semantic HTML, ARIA. Always relevant. |
| `backend/queries.md` | Database query optimization, indexing. Useful for any data model. |
| `backend/migrations.md` | Migration best practices. Universal. |

**Why Keep:**
These are **evergreen best practices** that apply regardless of product vision. They're about "how to implement well", not "what to implement".

---

## Category 4: KEEP - Design Principles (Layout & Hierarchy)

### Files to Preserve

#### Root `.agent-os/` design documents

| File | Why Keep | Notes |
|------|----------|-------|
| `DESIGN_SYSTEM.md` | Extracted from real refactoring work (explore page). Focus on **content-first hierarchy**, not emotion model. | ✅ Core principles still valid: "60% content, 40% chrome", "inline utility pattern", "progressive disclosure" |
| `design-principles.md` | Universal UX rules: content-first, inline pills, gestalt principles, visual clarity. | ✅ Not tied to emotion model. These are layout/hierarchy principles. |
| `component-patterns.md` | Reusable UI patterns (filter pills, grid layouts, modal patterns). | ✅ Implementation patterns, not product features. |
| `audit-methodology.md` | How to audit pages for UX violations (chrome-to-content ratio, etc.). | ✅ Process document, universally applicable. |
| `TYPOGRAPHY_GUIDELINES.md` | Typography scale, font usage, readability. | ✅ Implementation detail, agnostic to features. |

**Why Keep:**
These documents focus on **spatial design, information hierarchy, and interaction patterns**. They're about:
- "How much chrome is too much chrome?" (Universal)
- "Where should filters go?" (Universal)
- "How do we prioritize content?" (Universal)

They're NOT about:
- "Should we visualize emotion?" (Product-specific)
- "How should quality stratification work?" (Old metadata model)

**Important:** These docs may have **examples** that reference old features (e.g., "emotion filter pill"). That's fine—the **principles** are what matter. We'll revise examples as we build the new IA.

---

## Category 5: KEEP - Process & Workflow

### Files to Preserve

#### `.agent-os/workflows/` (Keep 2 files if general)

| File | Why Keep |
|------|----------|
| `README.md` | Describes Agent-OS workflow modes (Direct, Selective, Thorough). Not product-specific. |
| `WORKFLOW_SYSTEM_COMPLETE.md` | Documents the workflow implementation. Process-oriented. |

#### `.agent-os/` root process files

| File | Why Keep |
|------|----------|
| `config.yml` | Agent-OS configuration. Process document. |
| `README.md` | Overview of Agent-OS system. |
| `CURRENT_STATUS.md` | If it's a status tracker, consider removing. If it's process documentation, keep. |

**Why Keep:**
These describe **how to work** (Agent-OS modes, workflow patterns), not **what to build** (product features).

---

## Category 6: MIXED - Audit Reports (Revise Selectively)

### Files in `.agent-os/audits/` (~23 files)

| Type | Action |
|------|--------|
| Recent audits (2025-10-26, 2025-10-27) | **REMOVE** if they audit old features (emotion halos, quality stratification) |
| General UX audits (content ratio, typography, accessibility) | **KEEP** as case studies of how to audit |
| `run-visual-effects-audit.js` | **KEEP** if it's a general auditing script |

**Recommendation:** Delete all audit reports. They're historical artifacts of the old vision. If you need to reference the methodology, it's captured in `audit-methodology.md`.

---

## Category 7: REVISE - Homepage Hero Criteria

### File: `.agent-os/homepage-hero-criteria.md`

**Action:** **REVISE** to align with new IA

**Current State:** Likely defines hero section for Gallery Lobby (old IA)

**New State:** Homepage should introduce 4 modes (Browse, Explore, Search, Collections)

---

## Cleanup Action Plan

### Step 1: Backup (Safety First)

```bash
# Create backup of entire .agent-os directory
cp -r .agent-os .agent-os-backup-pre-pivot-$(date +%Y%m%d)
```

### Step 2: Remove Product Definition

```bash
# Remove old product docs
rm -rf .agent-os/product/
```

**Result:** Removes 7 files (mission, design-brief, roadmap, etc.)

### Step 3: Remove All Feature Specs

```bash
# Remove all old specs
rm -rf .agent-os/specs/
```

**Result:** Removes ~106 files (6 spec directories)

### Step 4: Remove Audit Reports

```bash
# Remove historical audits
rm -rf .agent-os/audits/
```

**Result:** Removes ~23 audit reports

### Step 5: Verify Keepers

```bash
# List what's left
ls -la .agent-os/

# Should see:
# - standards/ (6 files) ✅
# - workflows/ (2 files) ✅
# - DESIGN_SYSTEM.md ✅
# - design-principles.md ✅
# - component-patterns.md ✅
# - audit-methodology.md ✅
# - TYPOGRAPHY_GUIDELINES.md ✅
# - config.yml ✅
# - README.md ✅
```

### Step 6: Clean Root-Level Docs

```bash
# Review and potentially remove:
rm .agent-os/CURRENT_STATUS.md  # If it's old status
rm .agent-os/homepage-hero-criteria.md  # Will rewrite for new IA
```

### Step 7: Document the Pivot

```bash
# Create new product documents
touch .agent-os/product/NEW_MISSION.md
touch .agent-os/product/NEW_IA.md
touch .agent-os/product/METADATA_MODEL_V2.md
```

---

## What's Left After Cleanup (23 files)

### Implementation Standards (6 files)
- `.agent-os/standards/frontend/components.md`
- `.agent-os/standards/frontend/css.md`
- `.agent-os/standards/frontend/responsive.md`
- `.agent-os/standards/frontend/accessibility.md`
- `.agent-os/standards/backend/queries.md`
- `.agent-os/standards/backend/migrations.md`

### Design Principles (5 files)
- `.agent-os/DESIGN_SYSTEM.md`
- `.agent-os/design-principles.md`
- `.agent-os/component-patterns.md`
- `.agent-os/audit-methodology.md`
- `.agent-os/TYPOGRAPHY_GUIDELINES.md`

### Process & Workflow (4 files)
- `.agent-os/workflows/README.md`
- `.agent-os/workflows/WORKFLOW_SYSTEM_COMPLETE.md`
- `.agent-os/config.yml`
- `.agent-os/README.md`

### Root Codebase Docs (2 files)
- `CLAUDE.md` (Keep - tech stack and Agent-OS overview)
- `AGENTS.md` (Keep if it has useful patterns)

### Scripts (if any)
- `.agent-os/scripts/` (Keep utility scripts if not feature-specific)

**Total Kept:** ~23 files (17% of original 136 files)

---

## Validation Checklist

After cleanup, verify:

- [ ] No references to "emotion halos" in kept docs
- [ ] No references to "quality glow" or "quality stratification" in kept docs
- [ ] No references to "3D Emotion Galaxy" in kept docs
- [ ] No references to "Magnetic Filter Orbs" in kept docs
- [ ] No references to old 4-phase roadmap in kept docs
- [ ] Design principles are layout/hierarchy focused (not feature-specific)
- [ ] Standards are implementation best practices (not product features)
- [ ] CLAUDE.md still describes tech stack accurately (SvelteKit, Tailwind, Supabase)

---

## Next Steps After Cleanup

### 1. Define New Product Vision

**Create:** `.agent-os/product/NEW_MISSION.md`

**Contents:**
- Restate the new 4-mode IA (Browse, Explore, Search, Collections)
- Define new metadata model (Story, Action, Aesthetic)
- Define new personas aligned with modes (Traditionalist, Explorer, Seeker, Curator)

### 2. Document New Information Architecture

**Create:** `.agent-os/product/NEW_IA.md`

**Contents:**
```markdown
# Information Architecture v2.0

## 1. Browse (The Traditionalist)
- Traditional album-first, hierarchical view
- Simple, predictable, SmugMug-like experience
- Route: `/albums`, `/albums/[albumKey]`

## 2. Explore (The Explorer)
- AI-driven dynamic "Instagram feed"
- Innovative features: 3D Emotion Galaxy, Emotion Halos, Play Type Morphing Grid
- Route: `/explore`

## 3. Search (The Seeker)
- Advanced NLP search for action-based queries
- Natural language: "triumphant celebration blocks"
- Route: `/search`

## 4. Collections (The Curator)
- AI-generated thematic collections (Comeback Stories, Technical Excellence)
- User favorites
- Route: `/collections`, `/collections/[collectionId]`
```

### 3. Document New Metadata Model

**Create:** `.agent-os/product/METADATA_MODEL_V2.md`

**Contents:**
```markdown
# Metadata Model v2.0 - From Abstract to Concrete

## Old Model (DEPRECATED)
- ❌ emotion (abstract, not useful alone)
- ❌ quality_score (subjective, not actionable)

## New Model (ACTIVE)

### 1. Story (Narrative Context)
**Question:** "What Story does this photo belong to?"
**Examples:**
- "Game-Winning Rally"
- "Comeback Story"
- "Player Highlight Reel"

### 2. Action (Concrete Play Type)
**Question:** "What Action is in this photo?"
**Examples:**
- play_type: block, attack, dig, set, serve
- action_intensity: low, medium, high, peak

### 3. Aesthetic (Concrete Composition)
**Question:** "What Aesthetic does this photo have?"
**Examples:**
- composition: rule_of_thirds, leading_lines, framing
- time_of_day: golden_hour, blue_hour, midday
- lighting: backlit, soft, dramatic
```

---

## Conclusion

**Total Cleanup:** Remove 113 files (83%)

**Rationale:**
- Old product vision (emotion-first) is fundamentally incompatible with new pivot (story-first)
- All feature specs implement obsolete features
- Keeping implementation-agnostic standards ensures continuity for development patterns

**Benefit:**
- Clean slate for new IA without confusion
- Developers won't accidentally reference old features
- Design principles and standards remain intact
- No need to refactor hundreds of files—just delete and start fresh

**Risk Mitigation:**
- Backup created before deletion
- Kept all universal standards and best practices
- Can reference backup if needed for historical context

---

**Status:** Ready for your approval to execute cleanup

**Next Step:** Confirm this audit, then run cleanup script to remove deprecated documentation
