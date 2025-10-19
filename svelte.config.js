import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
			// Use environment variable to control base path:
			// - VITE_BASE_PATH='/gallery' for ninochavez.co proxy
			// - Unset (or empty) for standalone Vercel deployment at root
			base: process.env.VITE_BASE_PATH || ''
		},
		alias: {
			$lib: 'src/lib',
			$types: 'src/types',
		},
	},
};

export default config;
