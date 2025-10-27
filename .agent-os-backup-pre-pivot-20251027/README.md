# Nino Chavez Gallery - Agent Operating System

**Version:** 3.0.0
**Framework:** Multi-Mode Workflow for SvelteKit Development
**Last Updated:** 2025-10-22

Photography portfolio site built with SvelteKit + Svelte 5.

## Quick Start

### For AI Assistants

1. Read `.agent-os/config.yml`
2. Start working - Direct mode (default) for 90% of UI work
3. Auto-escalate to Selective/Thorough when needed

### Workflow Modes

| Mode | Usage | Token Budget | Use For |
|------|-------|--------------|---------|
| **Direct** ⭐ | 90% | 1,000 | Svelte components, styling, animations |
| **Selective** | 8% | 3,000 | Backend + frontend features |
| **Thorough** | 2% | 5,000 | Security, auth, performance |

**Default:** Direct mode (portfolio sites are mostly UI)

## Stack

- **SvelteKit 2.x** + Svelte 5 (Runes mode)
- **Tailwind CSS 4** - Styling
- **svelte-motion** - Animations
- **Supabase** - Database + Auth
- **TypeScript** - Type safety
- **Playwright** - E2E testing

## Svelte 5 Patterns

```svelte
<script lang="ts">
// Use runes mode
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log('Count changed:', count);
});
</script>
```

## Related Documentation

- `../CLAUDE.md` - AI development instructions
- `.agent-os/config.yml` - Configuration
- `../README.md` - Project overview
