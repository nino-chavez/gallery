/**
 * Robots.txt Generator
 *
 * Allows all crawlers (Google, Bing, AI bots) to index the site
 * Includes sitemap reference for search engines
 */

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const text = `# Robots.txt for Nino Chavez Photography Gallery
# Updated: 2025-10-19

User-agent: *
Allow: /
Allow: /photo/*
Allow: /explore
Allow: /collections
Allow: /albums/*
Allow: /about
Sitemap: https://photography.ninochavez.co/sitemap.xml

# AI Bot Specific Rules (Allow All)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

# Crawl Delay (optional, for heavy crawlers)
Crawl-delay: 1
`;

	return new Response(text, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
		}
	});
};
