# Agent Reference Guides

**Purpose:** Developer documentation specifically for AI agents. These guides provide proven patterns and prevent hallucinated approaches.

---

## Why These Guides Exist

AI agents can hallucinate new approaches or mix patterns from different projects. These guides ensure:

1. **Consistency:** All agents use the same patterns
2. **Correctness:** Patterns are tested and proven
3. **Efficiency:** No trial-and-error with wrong approaches
4. **Maintainability:** Centralized pattern documentation

---

## Available Guides

### [supabase-integration.md](./supabase-integration.md)
**When to use:** Any database operation in this project

**Covers:**
- Browser vs server client setup
- Common query patterns (filters, pagination, aggregations)
- Error handling patterns
- Type safety with Supabase
- Performance best practices
- Common mistakes to avoid

**Key patterns:**
- Always use server client in +page.server.ts
- Never use browser client with service role key
- Explicit error handling for all queries
- Use prepared functions, not raw queries

---

### [smugmug-api.md](./smugmug-api.md)
**When to use:** SmugMug API integration, EXIF extraction

**Covers:**
- OAuth 1.0a authentication (NOT OAuth 2.0)
- Common endpoints (albums, photos, metadata)
- EXIF data extraction patterns
- Rate limiting strategies
- Batch processing patterns
- Common mistakes to avoid

**Key patterns:**
- Must use OAuth 1.0a (SmugMug doesn't support OAuth 2.0)
- Explicit EXIF expansion in requests
- Rate limiting (5 requests/second)
- Date extraction from EXIF format

**Practical companion:** [smugmug-integration-practical.md](./smugmug-integration-practical.md)
- Quick start guide
- Working code examples
- Real-world use cases
- Supabase integration examples

---

### [typescript-patterns.md](./typescript-patterns.md)
**When to use:** All TypeScript code in this project

**Covers:**
- Type definitions for photos, albums, filters
- Interface vs type usage
- Function signature patterns
- Error handling with typed errors
- Async patterns (sequential, parallel, batch)
- Svelte 5 runes patterns ($state, $derived, $effect)
- Common mistakes to avoid

**Key patterns:**
- Use `interface` for object shapes, `type` for unions
- Option objects for multiple parameters
- Type guards for runtime checks
- Discriminated unions for state management

---

## How to Use These Guides

### Before Implementing

1. **Identify the task:**
   - Database query? → Check `supabase-integration.md`
   - SmugMug API call? → Check `smugmug-api.md`
   - TypeScript pattern? → Check `typescript-patterns.md`

2. **Find the pattern:**
   - Use table of contents
   - Search for similar examples
   - Check "Common Patterns" section

3. **Copy the pattern:**
   - Use the exact pattern from guide
   - Adapt variable names as needed
   - Don't invent variations

4. **Check mistakes section:**
   - Review "Common Mistakes to Avoid"
   - Ensure you're not repeating known errors

### Example Workflow

**Task:** Fetch photos filtered by sport

**❌ WITHOUT guides (hallucinated approach):**
```typescript
// Agent invents this approach
const response = await fetch('/api/photos?sport=volleyball');
const photos = await response.json();
```

**✅ WITH guides (correct approach):**
```typescript
// Agent reads supabase-integration.md → "Fetch with Filters" section
import { fetchPhotos } from '$lib/supabase/server';

const photos = await fetchPhotos({
  sportType: 'volleyball',
  limit: 24
});
```

---

## When to Create a New Guide

Create a new guide when:

1. **New integration added:**
   - New API (Stripe, Cloudflare, etc.)
   - New service (Analytics, Auth, etc.)
   - New database (if switching from Supabase)

2. **Pattern used 3+ times:**
   - If you implement same pattern repeatedly
   - If pattern is complex or error-prone
   - If pattern has project-specific nuances

3. **Common mistakes occur:**
   - If agents repeatedly make same mistakes
   - If pattern is easy to get wrong
   - If error messages are confusing

### Guide Template

```markdown
# [Integration/Pattern Name] Guide

**Purpose:** [Brief description]

---

## Table of Contents

1. [Setup](#setup)
2. [Common Patterns](#common-patterns)
3. [Error Handling](#error-handling)
4. [Common Mistakes](#common-mistakes)

---

## Setup

[Authentication, initialization, configuration]

---

## Common Patterns

### Pattern 1: [Name]

**When to use:** [Description]

**Implementation:**
\`\`\`typescript
// Code example with comments
\`\`\`

---

## Error Handling

[Standard error patterns]

---

## Common Mistakes to Avoid

### ❌ Mistake 1

[Wrong approach with explanation]

**Fix:**
[Correct approach]

---

## Related Documentation

- [Links to relevant docs]

---

**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Maintained By:** Agent-OS
```

---

## Maintenance

### Updating Guides

When to update:

- API changes
- New patterns discovered
- Common mistakes identified
- Performance improvements found

### Version Control

- Increment version number
- Update "Last Updated" date
- Document changes in guide itself

### Deprecation

When pattern is no longer valid:

1. Mark section as `[DEPRECATED]`
2. Explain why it's deprecated
3. Link to new pattern
4. Keep for 2 versions before removing

---

## Related Documentation

- `CLAUDE.md` - References these guides
- `.agent-os/implementation/` - Uses patterns from guides
- `docs/CODING_STANDARDS.md` - Higher-level standards

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Maintained By:** Agent-OS
