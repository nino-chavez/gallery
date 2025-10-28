/**
 * SmugMug API Client
 *
 * Handles authenticated requests to SmugMug API using OAuth 1.0a.
 * Based on patterns from gallery-enrichment/scripts/upload-to-smugmug.ts
 *
 * Usage:
 * ```typescript
 * import { SmugMugClient } from '$lib/smugmug/client';
 *
 * const client = new SmugMugClient();
 * const album = await client.getAlbum('albumKey');
 * await client.updateAlbum('albumKey', { Name: 'New Name' });
 * ```
 */

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export interface SmugMugAlbum {
	Uri: string;
	AlbumKey: string;
	Name: string;
	Description?: string;
	Keywords?: string[];
	WebUri: string;
	UrlName: string;
	// Date fields
	LastUpdated?: string;
	// Add other fields as needed
}

export interface SmugMugPhoto {
	ImageKey: string;
	FileName: string;
	Caption?: string;
	Keywords?: string[];
	EXIF?: {
		DateTimeOriginal?: string;
		Make?: string;
		Model?: string;
		[key: string]: any;
	};
}

export interface AlbumUpdatePayload {
	Name?: string;
	Description?: string;
	Keywords?: string[];
	Privacy?: 'Public' | 'Unlisted' | 'Private';
	SortMethod?: 'Position' | 'Caption' | 'FileName' | 'Date' | 'DateTimeOriginal' | 'DateAdded';
	SortDirection?: 'Ascending' | 'Descending';
}

export class SmugMugClient {
	private apiBase = 'https://api.smugmug.com';
	private apiVersion = 'api/v2';
	private oauth: OAuth;
	private token: { key: string; secret: string };

	constructor() {
		// Initialize OAuth client
		this.oauth = new OAuth({
			consumer: {
				key: process.env.SMUGMUG_API_KEY || '',
				secret: process.env.SMUGMUG_API_SECRET || '',
			},
			signature_method: 'HMAC-SHA1',
			hash_function: (baseString, key) =>
				crypto.createHmac('sha1', key).update(baseString).digest('base64'),
		});

		// Get access token
		this.token = {
			key: process.env.SMUGMUG_ACCESS_TOKEN || '',
			secret: process.env.SMUGMUG_ACCESS_TOKEN_SECRET || '',
		};

		if (!this.oauth.consumer.key || !this.oauth.consumer.secret) {
			throw new Error('Missing SmugMug API credentials (SMUGMUG_API_KEY, SMUGMUG_API_SECRET)');
		}

		if (!this.token.key || !this.token.secret) {
			throw new Error('Missing SmugMug access tokens (SMUGMUG_ACCESS_TOKEN, SMUGMUG_ACCESS_TOKEN_SECRET)');
		}
	}

	/**
	 * Make authenticated SmugMug API request
	 */
	private async request(
		method: string,
		endpoint: string,
		body?: any,
		headers: Record<string, string> = {}
	): Promise<any> {
		// Endpoint may already include /api/v2, so check and avoid duplication
		const url = endpoint.startsWith('/api/v2')
			? `${this.apiBase}${endpoint}`
			: `${this.apiBase}/${this.apiVersion}${endpoint}`;

		const requestData = {
			url,
			method,
		};

		const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, this.token));

		const response = await fetch(url, {
			method,
			headers: {
				...authHeader,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`SmugMug API error (${response.status}): ${errorText}`);
		}

		return await response.json();
	}

	/**
	 * Get album by album key
	 */
	async getAlbum(albumKey: string): Promise<SmugMugAlbum> {
		const result = await this.request('GET', `/album/${albumKey}`);
		return result.Response.Album;
	}

	/**
	 * Update album metadata
	 */
	async updateAlbum(albumKey: string, updates: AlbumUpdatePayload): Promise<SmugMugAlbum> {
		const result = await this.request('PATCH', `/album/${albumKey}`, updates);
		return result.Response.Album;
	}

	/**
	 * Get photos in an album
	 */
	async getAlbumPhotos(albumKey: string, count?: number): Promise<SmugMugPhoto[]> {
		const params = new URLSearchParams({
			count: String(count || 100),
		});

		const result = await this.request('GET', `/album/${albumKey}!images?${params}`);
		return result.Response.AlbumImage || [];
	}

	/**
	 * Get photo with EXIF metadata
	 * CRITICAL: Must include ?_expand=ImageMetadata to get EXIF
	 */
	async getPhotoWithExif(imageKey: string): Promise<SmugMugPhoto> {
		const result = await this.request(
			'GET',
			`/image/${imageKey}?_expand=ImageMetadata`
		);

		const image = result.Response.Image;
		const metadata = result.Response.ImageMetadata;

		return {
			ImageKey: image.ImageKey,
			FileName: image.FileName,
			Caption: image.Caption,
			Keywords: image.Keywords,
			EXIF: metadata
		};
	}

	/**
	 * Get album with all photos including EXIF data
	 * WARNING: Rate limited to 5 requests/second
	 */
	async getAlbumWithExif(
		albumKey: string,
		options: {
			maxPhotos?: number;
			onProgress?: (current: number, total: number) => void;
		} = {}
	): Promise<{
		album: SmugMugAlbum;
		photos: SmugMugPhoto[];
	}> {
		// Get album metadata
		const album = await this.getAlbum(albumKey);

		// Get all photos
		let photos = await this.getAlbumPhotos(albumKey);

		// Limit if requested
		if (options.maxPhotos && photos.length > options.maxPhotos) {
			photos = photos.slice(0, options.maxPhotos);
		}

		// Fetch EXIF for each photo with rate limiting
		const photosWithExif: SmugMugPhoto[] = [];

		for (let i = 0; i < photos.length; i++) {
			try {
				const photo = await this.getPhotoWithExif(photos[i].ImageKey);
				photosWithExif.push(photo);

				if (options.onProgress) {
					options.onProgress(i + 1, photos.length);
				}

				// Rate limiting: 200ms between requests (5 req/sec)
				if (i < photos.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 200));
				}
			} catch (error) {
				console.error(`Failed to fetch EXIF for ${photos[i].ImageKey}:`, error);
				// Add photo without EXIF
				photosWithExif.push(photos[i]);
			}
		}

		return {
			album,
			photos: photosWithExif
		};
	}

	/**
	 * Get authenticated user info
	 */
	async getAuthUser() {
		const result = await this.request('GET', '/!authuser');
		return result.Response.User;
	}

	/**
	 * Search for albums by name (useful for finding albums to update)
	 */
	async searchAlbums(query: string): Promise<SmugMugAlbum[]> {
		const result = await this.request('GET', `/folder/user/nino!albums?text=${encodeURIComponent(query)}`);
		return result.Response.Album || [];
	}

	/**
	 * Get all albums for the authenticated user
	 * Uses pagination to fetch all albums
	 */
	async getAllAlbums(): Promise<SmugMugAlbum[]> {
		// Get auth user to find UserAlbums URI
		const user = await this.getAuthUser();
		const albumsUri = user.Uris.UserAlbums.Uri;

		const allAlbums: SmugMugAlbum[] = [];
		let start = 1;
		const count = 100; // Max per page

		while (true) {
			const params = new URLSearchParams({
				start: String(start),
				count: String(count),
			});

			// Fetch albums from user's album URI
			const result = await this.request('GET', `${albumsUri}?${params}`);
			const albums = result.Response.Album || [];

			allAlbums.push(...albums);

			// Check if we've fetched all albums
			const pages = result.Response.Pages;
			if (!pages || !pages.NextPage) {
				break;
			}

			start += count;
		}

		return allAlbums;
	}
}

// Utility Functions

/**
 * Extract ISO date from EXIF DateTimeOriginal
 * Converts "2025:05:30 18:15:23" → "2025-05-30"
 */
export function extractExifDate(exif?: { DateTimeOriginal?: string }): string | undefined {
	if (!exif?.DateTimeOriginal) return undefined;

	// SmugMug/EXIF format: "YYYY:MM:DD HH:MM:SS"
	const [datePart] = exif.DateTimeOriginal.split(' ');
	return datePart.replace(/:/g, '-');
}

/**
 * Extract date range from photos with EXIF data
 */
export function extractDateRange(
	photos: SmugMugPhoto[]
): { earliest?: string; latest?: string } {
	const dates = photos
		.map(p => extractExifDate(p.EXIF))
		.filter((d): d is string => !!d)
		.sort();

	if (dates.length === 0) {
		return { earliest: undefined, latest: undefined };
	}

	return {
		earliest: dates[0],
		latest: dates[dates.length - 1]
	};
}

/**
 * Format date for canonical album naming
 * Single day: "May 30"
 * Multi-day: "May 2025"
 */
export function formatCanonicalDate(earliest?: string, latest?: string): string {
	if (!latest) return '';

	const [year, month, day] = latest.split('-').map(Number);
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const monthName = monthNames[month - 1];

	// Single day
	if (earliest === latest) {
		return `${monthName} ${day}`;
	}

	// Multi-day
	return `${monthName} ${year}`;
}
