import { fetchPhotos } from '../src/lib/supabase/server';

async function findVLAAlbums() {
  try {
    const photos = await fetchPhotos({ limit: 1000 });
    
    // Get unique VLA albums
    const vlaAlbums = new Map();
    photos.forEach(photo => {
      if (photo.album_name?.includes('VLA')) {
        vlaAlbums.set(photo.album_key, photo.album_name);
      }
    });

    console.log(`\nFound ${vlaAlbums.size} VLA albums:\n`);
    Array.from(vlaAlbums.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([key, name]) => {
        console.log(`${key}: ${name}`);
      });
  } catch (error) {
    console.error('Error:', error);
  }
}

findVLAAlbums();
