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
			// Set base to '/gallery' for SvelteKit routing and asset paths
			// Main site strips /gallery prefix: ninochavez.co/gallery/_app/* → nino-chavez-gallery.vercel.app/_app/*
			base: '/gallery',
			// Use absolute paths (not relative) so proxy rewrites work correctly
			relative: false
		},
		trailingSlash: 'never', //match config from main site to avoid redirect loops
		alias: {
			$lib: 'src/lib',
			$types: 'src/types',
		},
	},
};

export default config;
