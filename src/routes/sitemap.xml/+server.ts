/**
 * Sitemap.xml Generator
 *
 * Generates XML sitemap with all routes for SEO:
 * - Static pages (home, explore, collections, albums)
 * - Sport-specific landing pages
 * - Individual photo URLs (20K+)
 * - Album detail pages
 *
 * Submit to Google Search Console after deployment
 */

import { supabaseServer } from '$lib/supabase/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://gallery.ninochavez.com';

	try {
		// Fetch all photos with relevant metadata
		const { data: photos, error: photosError } = await supabaseServer
			.from('photo_metadata')
			.select('image_key, photo_date, enriched_at, portfolio_worthy, sport_type')
			.order('photo_date', { ascending: false });

		if (photosError) {
			console.error('Error fetching photos for sitemap:', photosError);
			return new Response('Error generating sitemap', { status: 500 });
		}

		// Fetch all unique albums
		const { data: albums, error: albumsError } = await supabaseServer
			.from('photo_metadata')
			.select('album_key, album_name')
			.not('album_key', 'is', null)
			.order('album_key');

		// Get unique albums (Supabase doesn't have DISTINCT with select, so dedupe in code)
		const uniqueAlbums = Array.from(
			new Map(albums?.map((a) => [a.album_key, a]) || []).values()
		);

		// Get unique sports for landing pages
		const uniqueSports = Array.from(new Set(photos?.map((p) => p.sport_type).filter(Boolean) || []));

		// Build URL list
		const urls = [
			// Static pages
			{
				loc: baseUrl,
				priority: 1.0,
				changefreq: 'daily' as const
			},
			{
				loc: `${baseUrl}/explore`,
				priority: 0.9,
				changefreq: 'daily' as const
			},
			{
				loc: `${baseUrl}/collections`,
				priority: 0.8,
				changefreq: 'weekly' as const
			},
			{
				loc: `${baseUrl}/albums`,
				priority: 0.8,
				changefreq: 'weekly' as const
			},
			{
				loc: `${baseUrl}/about`,
				priority: 0.7,
				changefreq: 'monthly' as const
			},

			// Sport-specific landing pages (future routes)
			...uniqueSports.map((sport) => ({
				loc: `${baseUrl}/${sport}`,
				priority: sport === 'volleyball' ? 0.9 : 0.7,
				changefreq: 'weekly' as const
			})),

			// Album detail pages
			...uniqueAlbums.map((album) => ({
				loc: `${baseUrl}/albums/${album.album_key}`,
				priority: 0.6,
				changefreq: 'monthly' as const
			})),

			// Individual photo URLs (THE MONEY MAKER - 20K+ URLs!)
			...(photos?.map((photo) => ({
				loc: `${baseUrl}/photo/${photo.image_key}`,
				lastmod: photo.photo_date || photo.enriched_at,
				priority: photo.portfolio_worthy ? 0.9 : 0.7,
				changefreq: 'monthly' as const
			})) || [])
		];

		// Generate XML
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`
	)
	.join('\n')}
</urlset>`;

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Sitemap generation error:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
