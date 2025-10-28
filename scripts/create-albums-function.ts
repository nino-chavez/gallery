/**
 * Script to create the get_albums_with_metadata database function
 * This function efficiently aggregates album data at the database level
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAlbumsFunction() {
  console.log('Creating get_albums_with_metadata function...');

  // Read the SQL file
  const sqlPath = join(process.cwd(), 'database/functions/get_albums_with_metadata.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  try {
    // Execute the SQL to create the function
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('Trying direct query...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✓ Function created successfully via API');
    } else {
      console.log('✓ Function created successfully via RPC');
    }

    // Test the function
    console.log('\nTesting function...');
    const { data, error: testError } = await supabase.rpc('get_albums_with_metadata', {
      sport_filter: null,
      category_filter: null,
    });

    if (testError) {
      console.error('✗ Test failed:', testError);
      throw testError;
    }

    console.log(`✓ Function works! Found ${data?.length || 0} albums`);

    if (data && data.length > 0) {
      console.log('\nSample album:');
      console.log(JSON.stringify(data[0], null, 2));
    }

  } catch (error) {
    console.error('Error creating function:', error);
    console.log('\n--- Manual Instructions ---');
    console.log('Please run this SQL manually in your Supabase SQL editor:');
    console.log('\nNavigate to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
    console.log('\nThen paste and execute the contents of:');
    console.log('database/functions/get_albums_with_metadata.sql');
    process.exit(1);
  }
}

createAlbumsFunction();
