#!/bin/bash

# Apply Timeline View to Supabase Database
#
# This script applies the timeline_months view using psql

set -e

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ SUPABASE_DB_URL not set"
  echo ""
  echo "📋 To apply this migration manually:"
  echo "   1. Go to Supabase Dashboard > SQL Editor"
  echo "   2. https://supabase.com/dashboard/project/[your-project]/sql"
  echo "   3. Copy and paste the contents of database/timeline-metadata-view.sql"
  echo "   4. Click 'Run'"
  echo ""
  exit 1
fi

echo "📊 Applying Timeline View Migration"
echo ""

# Apply the SQL file
psql "$SUPABASE_DB_URL" < database/timeline-metadata-view.sql

echo ""
echo "✅ Migration applied successfully!"
echo ""

# Test the view
echo "🧪 Testing view..."
echo ""

psql "$SUPABASE_DB_URL" -c "
  SELECT year, month, photo_count
  FROM timeline_months
  LIMIT 10;
"

echo ""
echo "📊 Year summary:"
echo ""

psql "$SUPABASE_DB_URL" -c "
  SELECT year, SUM(photo_count) as total_photos
  FROM timeline_months
  GROUP BY year
  ORDER BY year DESC;
"

echo ""
echo "✅ Timeline view is ready!"
