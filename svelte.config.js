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
			base: process.env.NODE_ENV === 'production' ? '/gallery' : ''
		},
		alias: {
			$lib: 'src/lib',
			$types: 'src/types',
		},
	},
};

export default config;
