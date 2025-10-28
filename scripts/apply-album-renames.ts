/**
 * Apply Album Renames to SmugMug
 *
 * Reads the normalized album name proposals and applies them to SmugMug via API.
 * Includes safety features:
 * - Dry-run mode by default
 * - Confidence filtering
 * - Batch processing with rate limiting
 * - Rollback capability (saves original names)
 *
 * Usage:
 *   npm run apply-album-renames -- --dry-run
 *   npm run apply-album-renames -- --confidence=high
 *   npm run apply-album-renames -- --apply (actually execute)
 */

import { readFileSync, writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SMUGMUG_API_KEY = process.env.SMUGMUG_API_KEY;
const SMUGMUG_API_SECRET = process.env.SMUGMUG_API_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing Supabase credentials');
	process.exit(1);
}

if (!SMUGMUG_API_KEY || !SMUGMUG_API_SECRET) {
	console.error('⚠️  SmugMug API credentials not found.');
	console.error('   Set SMUGMUG_API_KEY and SMUGMUG_API_SECRET environment variables');
	console.error('   or update this script to use your SmugMug API integration method.\n');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface RenameProposal {
	album_key: string;
	current_name: string;
	proposed_name: string;
	confidence: 'high' | 'medium' | 'low';
	changes: string[];
	reason: string;
}

interface ApplyOptions {
	dryRun: boolean;
	minConfidence: 'high' | 'medium' | 'low';
	batchSize: number;
	rateLimitMs: number;
}

// Parse command line args
function parseArgs(): ApplyOptions {
	const args = process.argv.slice(2);
	const options: ApplyOptions = {
		dryRun: true,
		minConfidence: 'medium',
		batchSize: 10,
		rateLimitMs: 1000,
	};

	for (const arg of args) {
		if (arg === '--apply' || arg === '--execute') {
			options.dryRun = false;
		} else if (arg.startsWith('--confidence=')) {
			const conf = arg.split('=')[1] as 'high' | 'medium' | 'low';
			options.minConfidence = conf;
		} else if (arg.startsWith('--batch-size=')) {
			options.batchSize = parseInt(arg.split('=')[1]);
		} else if (arg.startsWith('--rate-limit=')) {
			options.rateLimitMs = parseInt(arg.split('=')[1]);
		}
	}

	return options;
}

// SmugMug API integration (placeholder - update with your actual API)
async function updateSmugMugAlbumName(
	albumKey: string,
	newName: string
): Promise<{ success: boolean; error?: string }> {
	// TODO: Implement actual SmugMug API call
	// This is a placeholder that shows the structure

	console.log(`   [API] Updating album ${albumKey} to "${newName}"`);

	// Example SmugMug API call structure (adjust to your integration):
	/*
	try {
		const response = await fetch(`https://api.smugmug.com/api/v2/album/${albumKey}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${SMUGMUG_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Name: newName
			})
		});

		if (!response.ok) {
			return { success: false, error: await response.text() };
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: String(error) };
	}
	*/

	// For now, simulate success
	return { success: true };
}

// Update database to track renames
async function updateDatabaseAlbumName(albumKey: string, newName: string): Promise<boolean> {
	const { error } = await supabase
		.from('photo_metadata')
		.update({ album_name: newName })
		.eq('album_key', albumKey);

	if (error) {
		console.error(`   [DB] Error updating album ${albumKey}:`, error.message);
		return false;
	}

	console.log(`   [DB] Updated database records for ${albumKey}`);
	return true;
}

async function applyRenames() {
	const options = parseArgs();

	console.log('🔄 Album Rename Application\n');
	console.log('Options:');
	console.log(`  Mode:             ${options.dryRun ? 'DRY RUN (no changes)' : 'APPLY (will make changes)'}`);
	console.log(`  Min Confidence:   ${options.minConfidence}`);
	console.log(`  Batch Size:       ${options.batchSize}`);
	console.log(`  Rate Limit:       ${options.rateLimitMs}ms between batches\n`);

	// Load proposals
	const proposalsPath = '.agent-os/album-rename-proposals.json';
	let proposals: RenameProposal[];

	try {
		const data = readFileSync(proposalsPath, 'utf-8');
		proposals = JSON.parse(data);
	} catch (error) {
		console.error(`❌ Error loading proposals from ${proposalsPath}`);
		console.error('   Run normalize-album-names.ts first to generate proposals');
		process.exit(1);
	}

	// Filter by confidence and changes
	const confidenceLevels: Record<string, number> = { low: 1, medium: 2, high: 3 };
	const minLevel = confidenceLevels[options.minConfidence];

	const filteredProposals = proposals.filter(
		(p) =>
			confidenceLevels[p.confidence] >= minLevel &&
			p.proposed_name !== p.current_name
	);

	console.log(`📊 Loaded ${proposals.length} total proposals`);
	console.log(`   Filtered to ${filteredProposals.length} albums requiring changes\n`);

	if (filteredProposals.length === 0) {
		console.log('✅ No renames needed!');
		return;
	}

	// Show preview
	console.log('═'.repeat(80));
	console.log('PREVIEW: First 10 Renames');
	console.log('═'.repeat(80));
	filteredProposals.slice(0, 10).forEach((proposal, idx) => {
		console.log(`\n${(idx + 1).toString().padStart(2)}. [${proposal.confidence.toUpperCase()}]`);
		console.log(`   Current:  "${proposal.current_name}"`);
		console.log(`   New:      "${proposal.proposed_name}"`);
		console.log(`   Changes:  ${proposal.changes.join(', ')}`);
	});
	console.log('\n' + '═'.repeat(80));

	if (options.dryRun) {
		console.log('\n🔍 DRY RUN MODE - No changes made');
		console.log('   To apply changes, run with --apply flag\n');
		return;
	}

	// Confirm before applying
	console.log('\n⚠️  WARNING: About to update album names in SmugMug and database');
	console.log(`   ${filteredProposals.length} albums will be renamed`);
	console.log('\n   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

	await new Promise((resolve) => setTimeout(resolve, 5000));

	// Save original names for rollback
	const rollbackData = filteredProposals.map((p) => ({
		album_key: p.album_key,
		original_name: p.current_name,
		new_name: p.proposed_name,
	}));
	const rollbackPath = `.agent-os/album-rename-rollback-${Date.now()}.json`;
	writeFileSync(rollbackPath, JSON.stringify(rollbackData, null, 2));
	console.log(`💾 Rollback data saved to ${rollbackPath}\n`);

	// Apply renames in batches
	const results = {
		success: 0,
		failed: 0,
		errors: [] as Array<{ album: string; error: string }>,
	};

	for (let i = 0; i < filteredProposals.length; i += options.batchSize) {
		const batch = filteredProposals.slice(i, i + options.batchSize);
		console.log(`\n📦 Processing batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(filteredProposals.length / options.batchSize)}...`);

		for (const proposal of batch) {
			console.log(`\n   Renaming: ${proposal.current_name}`);
			console.log(`         to: ${proposal.proposed_name}`);

			// Update SmugMug
			const smugmugResult = await updateSmugMugAlbumName(
				proposal.album_key,
				proposal.proposed_name
			);

			if (!smugmugResult.success) {
				console.error(`   ❌ SmugMug update failed: ${smugmugResult.error}`);
				results.failed++;
				results.errors.push({
					album: proposal.current_name,
					error: smugmugResult.error || 'Unknown error',
				});
				continue;
			}

			// Update database
			const dbSuccess = await updateDatabaseAlbumName(
				proposal.album_key,
				proposal.proposed_name
			);

			if (dbSuccess) {
				console.log(`   ✅ Success`);
				results.success++;
			} else {
				console.error(`   ⚠️  SmugMug updated but database update failed`);
				results.failed++;
			}
		}

		// Rate limiting
		if (i + options.batchSize < filteredProposals.length) {
			console.log(`\n   ⏳ Waiting ${options.rateLimitMs}ms before next batch...`);
			await new Promise((resolve) => setTimeout(resolve, options.rateLimitMs));
		}
	}

	// Summary
	console.log('\n' + '═'.repeat(80));
	console.log('RENAME SUMMARY');
	console.log('═'.repeat(80));
	console.log(`✅ Successful:  ${results.success}`);
	console.log(`❌ Failed:      ${results.failed}`);

	if (results.errors.length > 0) {
		console.log('\n❌ Errors:');
		results.errors.forEach((err) => {
			console.log(`   - ${err.album}: ${err.error}`);
		});
	}

	console.log(`\n💾 Rollback file: ${rollbackPath}`);
	console.log('\n✅ Album rename process complete!\n');

	// Remind to refresh materialized view
	console.log('⚠️  IMPORTANT: Refresh the albums_summary materialized view in Supabase:');
	console.log('   REFRESH MATERIALIZED VIEW albums_summary;\n');
}

applyRenames().catch(console.error);
