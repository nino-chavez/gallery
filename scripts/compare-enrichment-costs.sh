#!/bin/bash
#
# Compare Enrichment Costs & Quality
# Tests 3 approaches on the same 50 photos
#

set -e

LIMIT=50
LOG_DIR="/tmp/enrichment-comparison"
mkdir -p "$LOG_DIR"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        Enrichment Cost & Quality Comparison Test             ║"
echo "║        Testing 3 approaches on $LIMIT photos                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Current approach (Combined prompt + Flash 2.0)
echo "📊 Test 1: Combined Prompt + Flash 2.0 (Current)"
echo "   Cost estimate: \$0.50 (\$0.01/photo)"
echo ""
TEST_LIMIT=$LIMIT npx tsx scripts/backfill-schema-v2-metadata.ts 2>&1 | tee "$LOG_DIR/test1-combined-flash2.log"

# Wait a bit
sleep 2

# Test 2: Simplified prompt + Flash 2.0
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test 2: Simplified Prompt + Flash 2.0 (Optimized)"
echo "   Cost estimate: \$0.20 (\$0.004/photo)"
echo ""
USE_SIMPLIFIED_PROMPT=true TEST_LIMIT=$LIMIT npx tsx scripts/backfill-schema-v2-metadata.ts 2>&1 | tee "$LOG_DIR/test2-simplified-flash2.log"

# Wait a bit
sleep 2

# Test 3: Simplified prompt + Flash 8B (Cheapest)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test 3: Simplified Prompt + Flash 8B (Cheapest)"
echo "   Cost estimate: \$0.10 (\$0.002/photo)"
echo ""
USE_SIMPLIFIED_PROMPT=true GEMINI_MODEL="gemini-1.5-flash-8b" TEST_LIMIT=$LIMIT npx tsx scripts/backfill-schema-v2-metadata.ts 2>&1 | tee "$LOG_DIR/test3-simplified-flash8b.log"

# Generate comparison report
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Comparison Summary                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "Extracting metrics from test logs..."
echo ""

# Extract costs and times
cost1=$(grep "Cost:" "$LOG_DIR/test1-combined-flash2.log" | tail -1 | awk '{print $3}')
cost2=$(grep "Cost:" "$LOG_DIR/test2-simplified-flash2.log" | tail -1 | awk '{print $3}')
cost3=$(grep "Cost:" "$LOG_DIR/test3-simplified-flash8b.log" | tail -1 | awk '{print $3}')

time1=$(grep "Elapsed:" "$LOG_DIR/test1-combined-flash2.log" | tail -1 | awk '{print $3}')
time2=$(grep "Elapsed:" "$LOG_DIR/test2-simplified-flash2.log" | tail -1 | awk '{print $3}')
time3=$(grep "Elapsed:" "$LOG_DIR/test3-simplified-flash8b.log" | tail -1 | awk '{print $3}')

rate1=$(grep "Rate:" "$LOG_DIR/test1-combined-flash2.log" | tail -1 | awk '{print $3}')
rate2=$(grep "Rate:" "$LOG_DIR/test2-simplified-flash2.log" | tail -1 | awk '{print $3}')
rate3=$(grep "Rate:" "$LOG_DIR/test3-simplified-flash8b.log" | tail -1 | awk '{print $3}')

echo "┌─────────────────────────┬──────────┬──────────┬────────────┐"
echo "│ Approach                │ Cost     │ Time     │ Rate       │"
echo "├─────────────────────────┼──────────┼──────────┼────────────┤"
printf "│ Combined + Flash 2.0    │ %-8s │ %-8s │ %-10s │\n" "$cost1" "$time1" "$rate1"
printf "│ Simplified + Flash 2.0  │ %-8s │ %-8s │ %-10s │\n" "$cost2" "$time2" "$rate2"
printf "│ Simplified + Flash 8B   │ %-8s │ %-8s │ %-10s │\n" "$cost3" "$time3" "$rate3"
echo "└─────────────────────────┴──────────┴──────────┴────────────┘"
echo ""

echo "📁 Full logs saved to: $LOG_DIR/"
echo ""
echo "Next steps:"
echo "1. Manually review extracted metadata quality in database"
echo "2. Check ai_confidence scores (should be similar across tests)"
echo "3. Verify lighting/color_temperature values are consistent"
echo ""
echo "To check extracted data:"
echo "  psql \$DATABASE_URL -c \"SELECT photo_id, lighting, color_temperature, time_in_game, ai_confidence FROM photo_metadata WHERE lighting IS NOT NULL ORDER BY RANDOM() LIMIT 10;\""
echo ""
