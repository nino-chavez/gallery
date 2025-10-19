import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Validate and normalize base path
// SvelteKit requires: empty string '' OR root-relative path that starts with '/' but doesn't end with '/'
function getBasePath() {
	const envPath = process.env.VITE_BASE_PATH;

	// If not set or empty, return empty string
	if (!envPath || envPath.trim() === '') {
		return '';
	}

	// Normalize: remove trailing slash if present, ensure leading slash
	let normalized = envPath.trim();
	if (normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}
	if (!normalized.startsWith('/')) {
		normalized = '/' + normalized;
	}

	return normalized;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Vercel adapter configuration
			runtime: 'nodejs20.x',
		}),
		paths: {
			// Configure base path for ninochavez.co/gallery proxy
			// Hardcoded to '/gallery' for production deployment
			// Local dev will override this in vite.config.ts if needed
			base: '/gallery',
			// Use absolute paths (not relative) so proxy rewrites work correctly
			// relative: false means assets use /gallery/_app/... instead of ./_app/...
			relative: false
		},
		alias: {
			$lib: 'src/lib',
			$types: 'src/types',
		},
	},
};

export default config;
