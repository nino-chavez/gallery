# Homepage Hero Photo Selection Criteria

**Version:** 1.0.0
**Last Updated:** 2025-10-26
**Status:** Active

---

## Overview

The homepage hero photo is the first impression visitors get of the photography portfolio. It must represent the absolute best work, both technically and artistically.

This document defines the selection criteria used in `src/routes/+page.server.ts` to ensure only optimal photos are displayed.

---

## Selection Criteria

### Primary Query (Optimal)

```typescript
.eq('portfolio_worthy', true)           // Must be curated
.eq('print_ready', true)                // Must be high-resolution
.eq('sport_type', 'volleyball')         // Volleyball photos only
.gte('sharpness', 8.0)                  // Technical excellence
.gte('composition_score', 8.0)          // Strong composition
.gte('emotional_impact', 7.5)           // Visual impact
.in('photo_category', ['action', 'celebration', 'portrait'])
```

### Threshold Breakdown

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| **portfolio_worthy** | `true` | Manually curated flag for portfolio inclusion |
| **print_ready** | `true` | Ensures high resolution (suitable for large displays) |
| **sport_type** | `volleyball` | Primary portfolio focus - volleyball action photography |
| **sharpness** | ≥ 8.0/10 | Technical excellence - sharp focus on subject |
| **composition_score** | ≥ 8.0/10 | Strong visual composition (rule of thirds, leading lines, etc.) |
| **emotional_impact** | ≥ 7.5/10 | Evokes emotion, tells a story |
| **photo_category** | action, celebration, portrait | Hero-worthy categories (excludes warmup, ceremony, candid) |

### Fallback Strategy (Cascading)

If the primary query returns no results, the system uses cascading fallbacks:

**Fallback 1: Volleyball Portfolio (Relaxed Quality)**
```typescript
.eq('portfolio_worthy', true)
.eq('sport_type', 'volleyball')
.not('sharpness', 'is', null)
```

**Fallback 2: Any Portfolio Photo (Multi-Sport)**
```typescript
.eq('portfolio_worthy', true)
.not('sharpness', 'is', null)
```

This ensures the homepage always displays something, prioritizing volleyball first, then falling back to any portfolio-worthy photo from other sports if necessary.

---

## Category Filtering

### Included Categories

- **action** - Dynamic sports action (attacks, blocks, digs, serves)
- **celebration** - Emotional moments of triumph and team connection
- **portrait** - Player portraits with strong emotional resonance

### Excluded Categories

- **warmup** - Pre-game warmup shots (lower energy)
- **ceremony** - Award ceremonies, team photos (less dynamic)
- **candid** - Behind-the-scenes, casual moments (not hero-worthy)

**Rationale:** The hero photo should showcase dynamic action or strong emotion. Warmup and candid shots, while valuable for album browsing, don't have the visual impact needed for a homepage hero.

---

## Quality Score Thresholds

### Why These Numbers?

The thresholds were chosen based on empirical analysis of the photo collection:

- **Sharpness ≥ 8.0:** Only ~15-20% of photos achieve this level. It represents tack-sharp focus on the subject with no motion blur.
- **Composition ≥ 8.0:** Photos with strong visual structure (rule of thirds, leading lines, depth of field). Top ~20% of collection.
- **Emotional Impact ≥ 7.5:** Lower threshold than technical metrics because emotion is subjective. Still represents top ~25% of collection.

**Distribution:**
```
Portfolio-worthy photos:     ~800 photos
+ Print-ready:               ~600 photos
+ Sharpness ≥ 8.0:           ~120 photos
+ Composition ≥ 8.0:         ~80 photos
+ Emotional Impact ≥ 7.5:    ~60 photos
+ Hero categories:           ~40-50 photos
```

This gives us a pool of 40-50 optimal hero candidates that rotate randomly.

---

## Implementation Details

### Randomization Strategy

1. Query database for 15 optimal candidates (using `.limit(15)`)
2. Pick random index client-side (`Math.floor(Math.random() * data.length)`)
3. Return single photo to client

**Why 15 candidates?**
- Large enough pool for variety across visits
- Small enough to keep query fast (<50ms)
- Ensures fresh hero photo on most page loads

### Performance Considerations

- Query uses indexed columns (`portfolio_worthy`, `print_ready`, `sharpness`, etc.)
- Single database query per page load
- Photo URL optimization handled client-side (Supabase transforms)
- Server-side rendering ensures photo is available immediately

---

## Maintenance & Tuning

### Monitoring

Check query performance and result counts:

```sql
-- Count of optimal hero candidates
SELECT COUNT(*) FROM photo_metadata
WHERE portfolio_worthy = true
  AND print_ready = true
  AND sharpness >= 8.0
  AND composition_score >= 8.0
  AND emotional_impact >= 7.5
  AND photo_category IN ('action', 'celebration', 'portrait')
  AND sharpness IS NOT NULL;
```

**Target:** 40-100 candidates

### Threshold Adjustment

If the candidate pool is:

- **Too small (<20):** Lower thresholds by 0.5
  - `sharpness >= 7.5`
  - `composition_score >= 7.5`
  - `emotional_impact >= 7.0`

- **Too large (>200):** Raise thresholds by 0.5
  - `sharpness >= 8.5`
  - `composition_score >= 8.5`
  - `emotional_impact >= 8.0`

### Seasonal Adjustments

As new photos are enriched and added to the collection:

1. **Monthly:** Review candidate count
2. **Quarterly:** Analyze fallback usage (should be <5% of page loads)
3. **Annually:** Re-evaluate threshold values based on collection growth

---

## Examples

### Optimal Hero Photo (Meets All Criteria)

```json
{
  "portfolio_worthy": true,
  "print_ready": true,
  "sharpness": 9.2,
  "composition_score": 8.8,
  "emotional_impact": 8.5,
  "photo_category": "action",
  "emotion": "intensity",
  "play_type": "attack"
}
```

### Edge Case: High Sharpness, Low Composition (Excluded)

```json
{
  "portfolio_worthy": true,
  "print_ready": true,
  "sharpness": 9.5,
  "composition_score": 6.5,  // ❌ Too low
  "emotional_impact": 8.0,
  "photo_category": "action"
}
```

### Edge Case: Warmup Photo (Excluded)

```json
{
  "portfolio_worthy": true,
  "print_ready": true,
  "sharpness": 8.5,
  "composition_score": 8.5,
  "emotional_impact": 7.8,
  "photo_category": "warmup"  // ❌ Not hero-worthy category
}
```

---

## Future Enhancements

### Potential Additions

1. **Time-of-day filtering:** Prefer golden hour photos (warm lighting)
2. **Emotion diversity:** Ensure variety of emotions across visits (track in cookie/session)
3. **Sport diversity:** For multi-sport portfolios, rotate between sports
4. **Aspect ratio:** Prefer vertical/square for split-screen layout
5. **User engagement:** Track which hero photos get most clicks to `/explore`

### A/B Testing Ideas

- Test lower thresholds to see if variety improves engagement
- Test category weights (e.g., prefer action > celebration > portrait)
- Test time-based rotation (different hero photo every hour vs every visit)

---

## Related Documentation

- [Design System](./DESIGN_SYSTEM.md) - Content-first principles
- [Photo Schema](../src/types/photo.ts) - PhotoMetadata type definitions
- [Supabase Server](../src/lib/supabase/server.ts) - Database queries

---

**Version History:**

- **v1.0.0 (2025-10-26):** Initial criteria definition
  - Established quality thresholds
  - Documented category filtering
  - Added fallback strategy
