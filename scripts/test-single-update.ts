import { SmugMugClient } from '../src/lib/smugmug/client';

async function testUpdate() {
  try {
    const client = new SmugMugClient();
    
    // Get current album
    console.log('Fetching current album...');
    const album = await client.getAlbum('zzSDBG');
    console.log(`Current name: "${album.Name}"`);
    
    // Update to canonical name
    const newName = 'GCU vs UCLA - Apr 4';
    console.log(`\nUpdating to: "${newName}"`);
    
    const updated = await client.updateAlbum('zzSDBG', { Name: newName });
    console.log(`\n✅ Updated successfully!`);
    console.log(`New name: "${updated.Name}"`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUpdate();
