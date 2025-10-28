# Album Name Normalization Workflow

**Purpose:** Standardize album names across the portfolio for consistency, user-friendliness, and better organization.

## Problem Statement

Current album names show inconsistent formatting:
- 74.8% have years, but in different formats (2023, 10-17-2023, 2023-10-17)
- Only 34.6% explicitly mention the sport
- Mix of formats: "2023 ACC vs Wheaton", "College VB – GCU vs UCLA – 2025-04-04", "Bruno & Beni"
- ISO dates (2025-04-04) instead of user-friendly dates (04-04-2025)
- Missing level prefixes (HS, College, Pro)
- Inconsistent separators (–, -, |)

## Proposed Standard Format

```
[Level] [Sport] - [Event/Teams] - [Date]
```

**Examples:**
- `HS VB - North Central vs Aurora - 09-15-2023`
- `College VB - Lewis vs UCLA - 01-11-2025`
- `Portrait - ACC Homecoming - 2022`
- `Track - DU Cross Country Invitational - 2023`

**Components:**
1. **Level** (optional): HS, MS, College, Men's, Women's, Boys, Girls, Pro
2. **Sport**: VB (Volleyball), Basketball, Soccer, Football, Baseball, Softball, Track, Portrait
3. **Event/Teams**: Clean event name or "Team A vs Team B" for matchups
4. **Date**:
   - Single-day events: MM-DD-YYYY (user-friendly)
   - Seasons/multi-day: YYYY or YYYY-YYYY (year range)

## Workflow

### Step 1: Analysis

```bash
npx tsx scripts/analyze-album-names.ts
```

**Output:**
- Pattern distribution report
- Quality issues detected
- Naming convention recommendations

**Key Findings:**
- 254 total albums
- 8 albums with formatting issues
- 190 albums have years (74.8%)
- 88 albums mention sport (34.6%)
- Average name length: 32 characters

### Step 2: Generate Proposals

```bash
npx tsx scripts/normalize-album-names.ts
```

**Output:**
- `.agent-os/album-rename-proposals.json` (structured data)
- `.agent-os/album-rename-proposals.csv` (human-readable spreadsheet)

**Proposal Details:**
- Current name vs proposed name
- Confidence level (high/medium/low)
- List of changes made
- Reason for normalization

**Review Process:**
1. Open `album-rename-proposals.csv` in Excel/Google Sheets
2. Review high-confidence proposals first (67 albums)
3. Spot-check medium-confidence proposals (187 albums)
4. Manually edit proposals if needed

### Step 3: Apply Changes (Dry Run)

```bash
npx tsx scripts/apply-album-renames.ts --dry-run
```

**What it does:**
- Loads proposals from JSON
- Filters by confidence level
- Shows preview of first 10 renames
- **Does NOT make any changes**

**Options:**
- `--dry-run` (default): Preview only
- `--confidence=high`: Only apply high-confidence renames
- `--confidence=medium`: Apply medium and high (default)
- `--batch-size=10`: Process 10 albums per batch
- `--rate-limit=1000`: Wait 1000ms between batches

### Step 4: Apply Changes (Execute)

```bash
npx tsx scripts/apply-album-renames.ts --apply --confidence=high
```

**What it does:**
1. Filters proposals by confidence level
2. Shows preview and waits 5 seconds for cancel
3. Saves rollback data to `.agent-os/album-rename-rollback-{timestamp}.json`
4. Updates SmugMug albums via API (TODO: implement API integration)
5. Updates database `album_name` field in `photo_metadata` table
6. Provides success/failure summary

**Safety Features:**
- Dry-run mode by default
- Rollback file created before changes
- Batch processing with rate limiting (avoid API throttling)
- Error handling with detailed logs
- Database + SmugMug updates tracked separately

### Step 5: Refresh Materialized View

After applying renames, refresh the `albums_summary` materialized view:

```sql
-- Run in Supabase SQL Editor
REFRESH MATERIALIZED VIEW albums_summary;
```

This ensures the Albums page shows updated names immediately.

## Rollback

If something goes wrong, rollback using the saved data:

```bash
# View rollback file
cat .agent-os/album-rename-rollback-{timestamp}.json

# TODO: Implement rollback script
npx tsx scripts/rollback-album-renames.ts .agent-os/album-rename-rollback-{timestamp}.json
```

## SmugMug API Integration

**Current Status:** Placeholder implementation

**Required:**
1. SmugMug API credentials (API Key + Secret)
2. OAuth authentication flow
3. Album update endpoint integration

**Implementation Location:**
- `scripts/apply-album-renames.ts` → `updateSmugMugAlbumName()` function

**SmugMug API Reference:**
- Endpoint: `PATCH /api/v2/album/{AlbumKey}`
- Body: `{ "Name": "new album name" }`
- Documentation: https://api.smugmug.com/api/v2/doc/

## Statistics

**Analysis Results (2025-10-28):**

| Metric | Value |
|--------|-------|
| Total Albums | 254 |
| Changes Proposed | 253 |
| High Confidence | 67 (26%) |
| Medium Confidence | 186 (73%) |
| Low Confidence | 1 (0.4%) |

**Common Changes:**
- ISO date → user-friendly date: 28 albums
- Added sport prefix: 166 albums (65%)
- Added level prefix: 77 albums (30%)
- Removed quotes: 1 album
- Fixed double spaces: 1 album

## Next Steps

1. **Review Proposals** - Open CSV and review proposed changes
2. **Test High-Confidence** - Apply only high-confidence renames first
3. **Implement SmugMug API** - Add actual API integration
4. **Monitor Results** - Check albums page after applying
5. **Iterate** - Refine normalization rules based on results

## Notes

- **Date Format Choice:** MM-DD-YYYY chosen for US audience familiarity
- **Sport Abbreviations:** VB for Volleyball keeps names concise
- **Separator:** " - " chosen for readability (spaces around dash)
- **Case Sensitivity:** Preserved from original (ACC, GCU, etc.)
- **Event Names:** Extracted from original name, cleaned of redundancy

## Files

- `scripts/analyze-album-names.ts` - Pattern analysis and reporting
- `scripts/normalize-album-names.ts` - Generate normalization proposals
- `scripts/apply-album-renames.ts` - Apply renames to SmugMug + database
- `.agent-os/album-rename-proposals.json` - Generated proposals (JSON)
- `.agent-os/album-rename-proposals.csv` - Generated proposals (CSV)
- `.agent-os/album-rename-rollback-*.json` - Rollback data (created on apply)

---

**Status:** ✅ Analysis complete, proposals generated, ready for review
**Last Updated:** 2025-10-28
