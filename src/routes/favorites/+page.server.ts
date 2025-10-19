/**
 * Favorites Page - Server-Side Metadata
 *
 * Note: Favorites are stored client-side in localStorage,
 * so this page is primarily for SEO and metadata.
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		seo: {
			title: 'My Favorites | Nino Chavez Photography',
			description: 'View and manage your favorite action sports photos. Save, organize, and export your personal collection of memorable moments.',
			keywords: 'favorites, saved photos, bookmarks, photo collection, action sports photography',
			canonical: 'https://gallery.ninochavez.com/favorites'
		}
	};
};
