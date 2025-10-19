# Nino Chavez Gallery - SvelteKit

A modern photo gallery application showcasing volleyball photography, built with SvelteKit + Svelte 5.

## Project Overview

This is a complete migration from React + Next.js 15 to SvelteKit + Svelte 5. The project leverages:

- **SvelteKit 2.x** - Full-stack framework with server-side rendering
- **Svelte 5 (Runes mode)** - Modern reactive UI with `$state`, `$derived`, `$effect`
- **Tailwind CSS 4** - Utility-first styling
- **svelte-motion** - Smooth animations and transitions
- **Supabase** - PostgreSQL database and authentication
- **TypeScript** - Full type safety

## Migration Status

See [`MIGRATION_STATUS.md`](./MIGRATION_STATUS.md) for detailed migration progress and feature status.

**Previous Version:** The React + Next.js implementation is archived at `../archive/nino-chavez-gallery`

## Agent-OS Integration

This project uses **Agent-OS** for structured development workflows. See [`.agent-os/CURRENT_STATUS.md`](.agent-os/CURRENT_STATUS.md) for:
- Current implementation status
- Available specs for migration
- Next priorities and roadmap

All React component specs are available in `.agent-os/specs/` and can be adapted for SvelteKit.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
