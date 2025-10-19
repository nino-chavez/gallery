import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Set base to '/gallery' so assets are referenced as /gallery/assets/*
	// Main site strips /gallery prefix: ninochavez.co/gallery/assets/* → nino-chavez-gallery.vercel.app/assets/*
	base: '/gallery',
	plugins: [sveltekit()]
});
