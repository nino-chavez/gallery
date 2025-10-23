# Nino Chavez Gallery - AI Development Instructions

**Stack:** SvelteKit 2.x + Svelte 5 + Tailwind CSS 4 + Supabase
**Type:** Photography Portfolio Site

## Project Overview

Modern photography gallery showcasing volleyball photography.

**Current Phase:** SvelteKit Migration (from React/Next.js)

## Agent Operating System

**Version:** 3.0.0 - Multi-Mode Workflow

### Workflow Modes

| Mode | Usage | Token Savings |
|------|-------|---------------|
| **Direct** ⭐ | 90% | 70-80% |
| **Selective** | 8% | 40-50% |
| **Thorough** | 2% | 0% |

**Default:** Direct mode (UI-focused work)

## Tech Stack

**Frontend:**
- SvelteKit 2.x (SSR framework)
- Svelte 5 with Runes ($state, $derived, $effect)
- Tailwind CSS 4
- svelte-motion (animations)

**Backend:**
- Supabase PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

**Testing:**
- Playwright (E2E)

## SvelteKit Patterns

### Server Load Functions

```typescript
// src/routes/gallery/+page.server.ts
export async function load({ locals }) {
  const { data } = await locals.supabase
    .from('photos')
    .select('*')
  return { photos: data }
}
```

### Form Actions

```typescript
// src/routes/upload/+page.server.ts
export const actions = {
  upload: async ({ request, locals }) => {
    // Handle form submission
  }
}
```

### Svelte 5 Runes

```svelte
<script lang="ts">
let photos = $state<Photo[]>([]);
let filtered = $derived(photos.filter(p => p.featured));

$effect(() => {
  // Side effects
});
</script>
```

## Common Tasks

**Direct Mode (90%):**
```
"Create photo grid component with Tailwind"
"Add animation to gallery lightbox"
"Update hero section styling"
"Fix responsive layout on mobile"
```

**Selective Mode (8%):**
```
"Implement photo upload with Supabase Storage"
"Add user authentication flow"
"Create admin dashboard for photo management"
```

**Thorough Mode (2%):**
```
"Implement secure photo upload with RLS"
"Add authentication with session management"
"Optimize image loading performance"
```

## Validation

```bash
npm run check  # Svelte type checking
npm run build  # Production build
npm test       # Playwright tests
```

## Related Documentation

- `.agent-os/README.md` - Agent-OS overview
- `.agent-os/config.yml` - Configuration

---

**Version:** 3.0.0
**Last Updated:** 2025-10-22
