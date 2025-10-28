/**
 * Favorites Store - Manage user's favorite photos with localStorage persistence
 * Week 3: Engagement Features
 * Enhanced: Toast notifications for user feedback
 */

import type { Photo } from '$types/photo';
import { toast } from './toast.svelte';

const STORAGE_KEY = 'gallery-favorites';
const MAX_FAVORITES = 100; // Prevent unlimited storage growth

interface FavoritesState {
	photoIds: Set<string>;
	photos: Map<string, Photo>;
}

function createFavoritesStore() {
	// Initialize from localStorage (browser-only)
	const initialState: FavoritesState = {
		photoIds: new Set(),
		photos: new Map()
	};

	if (typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				initialState.photoIds = new Set(parsed.photoIds || []);
				initialState.photos = new Map(
					(parsed.photos || []).map((photo: Photo) => [photo.image_key, photo])
				);
			}
		} catch (error) {
			console.error('[Favorites] Failed to load from localStorage:', error);
		}
	}

	let state = $state<FavoritesState>(initialState);

	// Save to localStorage whenever state changes
	function saveToStorage() {
		if (typeof window === 'undefined') return;

		try {
			const toStore = {
				photoIds: Array.from(state.photoIds),
				photos: Array.from(state.photos.values())
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
		} catch (error) {
			console.error('[Favorites] Failed to save to localStorage:', error);
		}
	}

	return {
		// Reactive getters
		get photoIds() {
			return state.photoIds;
		},
		get photos() {
			return Array.from(state.photos.values());
		},
		get count() {
			return state.photoIds.size;
		},

		// Check if photo is favorited
		isFavorite(photoId: string): boolean {
			return state.photoIds.has(photoId);
		},

		// Add photo to favorites
		addFavorite(photo: Photo) {
			// Check limit
			if (state.photoIds.size >= MAX_FAVORITES && !state.photoIds.has(photo.image_key)) {
				throw new Error(`Maximum ${MAX_FAVORITES} favorites reached`);
			}

			state.photoIds.add(photo.image_key);
			state.photos.set(photo.image_key, photo);
			saveToStorage();
		},

		// Remove photo from favorites
		removeFavorite(photoId: string) {
			state.photoIds.delete(photoId);
			state.photos.delete(photoId);
			saveToStorage();
		},

		// Toggle favorite status
		toggleFavorite(photo: Photo): boolean {
			const isFav = state.photoIds.has(photo.image_key);

			if (isFav) {
				this.removeFavorite(photo.image_key);
				toast.info('Removed from favorites', { duration: 2000 });
				return false;
			} else {
				try {
					this.addFavorite(photo);
					const count = state.photoIds.size;
					toast.success(`❤️ Added to favorites! (${count} total)`, {
						duration: 3000
					});
					return true;
				} catch (error) {
					// Handle max favorites error
					if (error instanceof Error && error.message.includes('Maximum')) {
						toast.error(`Maximum ${MAX_FAVORITES} favorites reached`, {
							duration: 4000
						});
					} else {
						toast.error('Failed to add to favorites', { duration: 3000 });
					}
					return false;
				}
			}
		},

		// Clear all favorites
		clearAll() {
			state.photoIds.clear();
			state.photos.clear();
			saveToStorage();
		},

		// Export favorites as JSON (for backup)
		exportFavorites(): string {
			return JSON.stringify({
				exported: new Date().toISOString(),
				count: state.photoIds.size,
				photos: this.photos
			});
		},

		// Import favorites from JSON (for restore)
		importFavorites(json: string) {
			try {
				const imported = JSON.parse(json);
				if (!imported.photos || !Array.isArray(imported.photos)) {
					throw new Error('Invalid import format');
				}

				// Clear existing
				state.photoIds.clear();
				state.photos.clear();

				// Import photos (respect limit)
				const photosToImport = imported.photos.slice(0, MAX_FAVORITES);
				photosToImport.forEach((photo: Photo) => {
					state.photoIds.add(photo.image_key);
					state.photos.set(photo.image_key, photo);
				});

				saveToStorage();
				return photosToImport.length;
			} catch (error) {
				console.error('[Favorites] Import failed:', error);
				throw error;
			}
		}
	};
}

export const favorites = createFavoritesStore();
