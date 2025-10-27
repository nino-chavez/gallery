#!/bin/bash

# Load environment variables
set -a
source .env.local
set +a

# Set test parameters
export DRY_RUN="${DRY_RUN:-false}"
export ALBUM_KEY="${ALBUM_KEY:-5dvLQR}"

echo "Running backfill test with:"
echo "  DRY_RUN: $DRY_RUN"
echo "  ALBUM_KEY: $ALBUM_KEY"
echo ""

# Run the backfill script
npx tsx scripts/backfill-schema-v2-metadata.ts
