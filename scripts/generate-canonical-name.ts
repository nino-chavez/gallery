#!/usr/bin/env tsx
/**
 * Generate Canonical Album Name CLI
 *
 * Standalone utility for generating canonical album names.
 * Can be used by enrichment pipelines, scripts, or manual testing.
 *
 * Usage:
 *   # From existing name
 *   npx tsx scripts/generate-canonical-name.ts --name "HS VB - Team A vs Team B - 2025"
 *
 *   # From explicit metadata
 *   npx tsx scripts/generate-canonical-name.ts \
 *     --teams "Downers Grove North,Plainfield South" \
 *     --date "2025-05-30"
 *
 *   # From event
 *   npx tsx scripts/generate-canonical-name.ts \
 *     --event "Chicago Christian Invitational" \
 *     --sport "volleyball" \
 *     --dates "2022-08-26,2022-08-27"
 *
 *   # Batch mode (from file)
 *   cat albums.txt | npx tsx scripts/generate-canonical-name.ts --batch
 */

import {
	generateCanonicalName,
	generateCanonicalNameFromSmugMug,
	validateCanonicalName,
	type AlbumNameInput,
	type SmugMugAlbumData,
} from '../src/lib/utils/canonical-album-naming';

interface CLIOptions {
	name?: string;
	teams?: string; // Comma-separated
	event?: string;
	sport?: string;
	date?: string; // Single date or comma-separated range
	dates?: string; // Alias for date
	batch?: boolean;
	validate?: boolean;
	json?: boolean; // Output as JSON
	smugmug?: string; // Path to SmugMug album JSON file
	albumKey?: string; // SmugMug album key
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--name' && args[i + 1]) {
			options.name = args[++i];
		} else if (arg === '--teams' && args[i + 1]) {
			options.teams = args[++i];
		} else if (arg === '--event' && args[i + 1]) {
			options.event = args[++i];
		} else if (arg === '--sport' && args[i + 1]) {
			options.sport = args[++i];
		} else if ((arg === '--date' || arg === '--dates') && args[i + 1]) {
			options.date = args[++i];
		} else if (arg === '--smugmug' && args[i + 1]) {
			options.smugmug = args[++i];
		} else if (arg === '--album-key' && args[i + 1]) {
			options.albumKey = args[++i];
		} else if (arg === '--batch') {
			options.batch = true;
		} else if (arg === '--validate') {
			options.validate = true;
		} else if (arg === '--json') {
			options.json = true;
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp() {
	console.log(`
Generate Canonical Album Name

USAGE:
  npx tsx scripts/generate-canonical-name.ts [OPTIONS]

OPTIONS:
  --name <string>         Existing album name to normalize (LEGACY)
  --teams <home,away>     Team names for matchup (comma-separated)
  --event <string>        Event name
  --sport <string>        Sport type (volleyball, basketball, etc.)
  --date <date>           Single date (ISO format)
  --dates <start,end>     Date range (comma-separated ISO dates)
  --smugmug <path>        Path to SmugMug album JSON file (NEW: uses EXIF/API data)
  --album-key <key>       SmugMug album key (for display in output)
  --batch                 Read album names from stdin (one per line)
  --validate              Only validate, don't generate new name
  --json                  Output as JSON
  --help, -h              Show this help message

EXAMPLES:
  # NEW: Generate from SmugMug album JSON (uses EXIF dates + enrichment)
  npx tsx scripts/generate-canonical-name.ts \\
    --smugmug album-data.json \\
    --json

  # Generate from matchup (LEGACY)
  npx tsx scripts/generate-canonical-name.ts \\
    --teams "Downers Grove North,Plainfield South" \\
    --date "2025-05-30"

  # Generate from event (LEGACY)
  npx tsx scripts/generate-canonical-name.ts \\
    --event "Chicago Christian Invitational" \\
    --sport "volleyball" \\
    --dates "2022-08-26,2022-08-27"

  # Normalize existing name (LEGACY)
  npx tsx scripts/generate-canonical-name.ts \\
    --name "HS VB - Team A vs Team B - 2025"

  # JSON output (for scripting)
  npx tsx scripts/generate-canonical-name.ts \\
    --name "Old Name" \\
    --json

SmugMug Album JSON Format:
  {
    "albumKey": "abc123",
    "name": "Existing Album Name",
    "dateStart": "2025-05-30",
    "dateEnd": "2025-05-30",
    "keywords": ["volleyball", "high-school"],
    "photos": [
      {
        "exif": { "DateTimeOriginal": "2025:05:30 14:23:15" }
      }
    ],
    "enrichment": {
      "teams": { "home": "Team A", "away": "Team B" },
      "sportType": "volleyball"
    }
  }
`);
}

async function processSmugMugAlbum(options: CLIOptions): Promise<void> {
	if (!options.smugmug) {
		console.error('❌ Error: --smugmug path is required');
		process.exit(1);
	}

	// Load SmugMug album JSON
	const fs = await import('fs');
	const albumDataRaw = fs.readFileSync(options.smugmug, 'utf-8');
	const albumData: SmugMugAlbumData = JSON.parse(albumDataRaw);

	// Generate canonical name using new algorithm
	const result = generateCanonicalNameFromSmugMug(albumData);

	if (options.json) {
		console.log(
			JSON.stringify(
				{
					albumKey: albumData.albumKey,
					existingName: albumData.name,
					proposedName: result.name,
					length: result.length,
					truncated: result.truncated,
					components: result.components,
					metadata: result.metadata,
					driftScore: result.driftScore,
					driftAnalysis: result.driftAnalysis,
				},
				null,
				2
			)
		);
	} else {
		console.log(`\n📁 Album: ${albumData.albumKey || 'Unknown'}`);
		console.log(`\nEXISTING: ${albumData.name}`);
		console.log(`PROPOSED: ${result.name} (${result.length} chars)`);
		console.log(`\nDate Source: ${result.metadata.dateSource.toUpperCase()}`);
		console.log(`Confidence: ${result.metadata.confidence.toUpperCase()}`);

		if (result.driftScore !== undefined) {
			console.log(`\nDrift Score: ${result.driftScore}/100`);

			if (result.driftAnalysis && result.driftAnalysis.changes.length > 0) {
				console.log('\nChanges:');
				result.driftAnalysis.changes.forEach((change) => console.log(`  • ${change}`));
			}
		}

		if (result.truncated) {
			console.log('\n⚠️  Name was truncated to fit length limit');
		}

		if (result.length <= 35) {
			console.log('✅ Optimal length for scanning');
		} else if (result.length <= 45) {
			console.log('⚠️  Will wrap to 2 lines on mobile');
		} else {
			console.log('❌ Exceeds maximum length');
		}

		// Validate the generated name
		const validation = validateCanonicalName(result.name);
		if (validation.warnings.length > 0) {
			console.log('\nWarnings:');
			validation.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
		}
	}
}

function processAlbum(options: CLIOptions): void {
	const input: AlbumNameInput = {};

	// Build input from options
	if (options.name) {
		input.currentName = options.name;
	}

	if (options.teams) {
		const [home, away] = options.teams.split(',').map((t) => t.trim());
		if (home && away) {
			input.teams = { home, away };
		}
	}

	if (options.event) {
		input.eventName = options.event;
	}

	if (options.sport) {
		input.sportType = options.sport;
	}

	if (options.date) {
		const dates = options.date.split(',').map((d) => d.trim());
		input.earliestPhotoDate = dates[0];
		input.latestPhotoDate = dates[1] || dates[0];
	}

	// Validate only mode
	if (options.validate && options.name) {
		const validation = validateCanonicalName(options.name);

		if (options.json) {
			console.log(JSON.stringify(validation, null, 2));
		} else {
			console.log(`\nValidation: ${options.name}`);
			console.log(`Valid: ${validation.valid ? '✅' : '❌'}`);

			if (validation.errors.length > 0) {
				console.log('\nErrors:');
				validation.errors.forEach((err) => console.log(`  ❌ ${err}`));
			}

			if (validation.warnings.length > 0) {
				console.log('\nWarnings:');
				validation.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
			}
		}
		return;
	}

	// Generate canonical name
	const result = generateCanonicalName(input);

	if (options.json) {
		console.log(
			JSON.stringify(
				{
					input: options.name || options.event || options.teams,
					output: result.name,
					length: result.length,
					truncated: result.truncated,
					components: result.components,
					metadata: result.metadata,
				},
				null,
				2
			)
		);
	} else {
		if (options.name) {
			console.log(`\nBEFORE: ${options.name}`);
		}
		console.log(`AFTER:  ${result.name} (${result.length} chars)`);

		if (result.truncated) {
			console.log('⚠️  Name was truncated to fit length limit');
		}

		if (result.length <= 35) {
			console.log('✅ Optimal length for scanning');
		} else if (result.length <= 45) {
			console.log('⚠️  Will wrap to 2 lines on mobile');
		}

		// Validate the generated name
		const validation = validateCanonicalName(result.name);
		if (validation.warnings.length > 0) {
			console.log('\nWarnings:');
			validation.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
		}
	}
}

async function batchMode(): Promise<void> {
	const readline = await import('readline');
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	console.log('Reading album names from stdin (one per line)...\n');

	rl.on('line', (line: string) => {
		const name = line.trim();
		if (name) {
			const result = generateCanonicalName({ currentName: name });
			console.log(`${name} → ${result.name}`);
		}
	});

	rl.on('close', () => {
		console.log('\n✅ Batch processing complete');
	});
}

// Main execution
const options = parseArgs();

if (options.batch) {
	batchMode();
} else if (options.smugmug) {
	// NEW: SmugMug album JSON mode (uses EXIF + API data)
	processSmugMugAlbum(options);
} else if (!options.name && !options.teams && !options.event) {
	console.error('❌ Error: Must provide --smugmug, --name, --teams, or --event');
	console.error('Run with --help for usage information');
	process.exit(1);
} else {
	// LEGACY: Direct input mode
	processAlbum(options);
}
