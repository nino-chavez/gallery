/**
 * Apply Timeline View to Database
 *
 * Uses Supabase service role to create the view
 */

import postgres from 'postgres';

// Extract connection details from Supabase URL
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

// Construct direct Postgres connection string
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

if (!dbPassword) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD environment variable');
  console.log('\n📋 To apply this migration:');
  console.log('   1. Go to Supabase Dashboard > SQL Editor');
  console.log('   2. Copy the SQL from database/timeline-metadata-view.sql');
  console.log('   3. Run it manually');
  console.log('\n   OR');
  console.log('\n   Set SUPABASE_DB_PASSWORD and run this script again\n');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

async function applyMigration() {
  console.log('📊 Applying Timeline View Migration\n');

  const sql = postgres(connectionString, {
    ssl: 'require'
  });

  try {
    // Drop existing view
    console.log('🗑️  Dropping existing view if it exists...');
    await sql`DROP VIEW IF EXISTS timeline_months CASCADE`;

    // Create view
    console.log('📝 Creating timeline_months view...\n');

    await sql`
      CREATE VIEW timeline_months AS
      WITH monthly_base AS (
        SELECT
          DATE_TRUNC('month', upload_date) AS month_start,
          EXTRACT(YEAR FROM upload_date)::INTEGER AS year,
          EXTRACT(MONTH FROM upload_date)::INTEGER AS month,
          sport_type,
          photo_category,
          upload_date,
          sharpness,
          portfolio_worthy
        FROM photo_metadata
        WHERE sharpness IS NOT NULL
      ),
      sport_agg AS (
        SELECT
          month_start,
          jsonb_object_agg(
            COALESCE(sport_type, 'unknown'),
            count
          ) AS sport_counts
        FROM (
          SELECT
            month_start,
            sport_type,
            COUNT(*) as count
          FROM monthly_base
          GROUP BY month_start, sport_type
        ) s
        GROUP BY month_start
      ),
      category_agg AS (
        SELECT
          month_start,
          jsonb_object_agg(
            COALESCE(photo_category, 'unknown'),
            count
          ) AS category_counts
        FROM (
          SELECT
            month_start,
            photo_category,
            COUNT(*) as count
          FROM monthly_base
          GROUP BY month_start, photo_category
        ) c
        GROUP BY month_start
      )
      SELECT
        b.month_start,
        b.year,
        b.month,
        COUNT(*) AS photo_count,
        s.sport_counts,
        c.category_counts,
        MIN(b.upload_date) AS first_photo_date,
        MAX(b.upload_date) AS last_photo_date,
        ROUND(AVG(b.sharpness)::NUMERIC, 2) AS avg_sharpness,
        COUNT(*) FILTER (WHERE b.portfolio_worthy = true) AS portfolio_count
      FROM monthly_base b
      LEFT JOIN sport_agg s ON b.month_start = s.month_start
      LEFT JOIN category_agg c ON b.month_start = c.month_start
      GROUP BY b.month_start, b.year, b.month, s.sport_counts, c.category_counts
      ORDER BY b.year DESC, b.month DESC
    `;

    console.log('✅ View created successfully!\n');

    // Test the view
    console.log('🧪 Testing view...\n');

    const months = await sql`
      SELECT year, month, photo_count, sport_counts, category_counts
      FROM timeline_months
      LIMIT 10
    `;

    console.log(`✅ Found ${months.length} months in timeline:\n`);

    for (const month of months) {
      const sportSummary = month.sport_counts
        ? Object.entries(month.sport_counts)
            .map(([sport, count]) => `${sport}:${count}`)
            .join(', ')
        : 'none';

      console.log(`  ${month.year}-${String(month.month).padStart(2, '0')}: ${month.photo_count} photos (${sportSummary})`);
    }

    // Show year summary
    const yearSummary = await sql`
      SELECT year, SUM(photo_count) as total_photos
      FROM timeline_months
      GROUP BY year
      ORDER BY year DESC
    `;

    console.log('\n📊 Total photos by year:');
    for (const row of yearSummary) {
      console.log(`  ${row.year}: ${Number(row.total_photos).toLocaleString()} photos`);
    }

    console.log('\n✅ Timeline view is ready!');

    await sql.end();
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    await sql.end();
    process.exit(1);
  }
}

applyMigration().catch(console.error);
