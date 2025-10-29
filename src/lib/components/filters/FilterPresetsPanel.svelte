<!--
  FilterPresetsPanel Component - Quick access to presets and history

  Shows predefined presets, recent filters, and filter history.
  Allows quick application of saved filter combinations.

  Features:
  - Predefined presets (Action Shots, Golden Hour, etc.)
  - Recent filter history (last 5 used)
  - One-click apply
  - Expandable panel (collapsed by default on mobile)

  Usage:
  <FilterPresetsPanel
    onApplyPreset={handleApplyPreset}
    onApplyHistory={handleApplyHistory}
  />
-->

<script lang="ts">
	import {
		ChevronDown,
		Clock,
		Sparkles,
		Zap,
		Sunrise,
		Flame,
		Lightbulb,
		Award,
		Grid3x3
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { filterPresets, type FilterPreset } from '$lib/stores/filter-presets.svelte';
	import { filterHistory, type FilterHistoryEntry } from '$lib/stores/filter-history.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';

	interface Props {
		onApplyPreset?: (filters: FilterPreset['filters']) => void;
		onApplyHistory?: (filters: FilterHistoryEntry['filters']) => void;
	}

	let { onApplyPreset, onApplyHistory }: Props = $props();

	let presetsExpanded = $state(false);
	let historyExpanded = $state(false);

	// Map icon names to Lucide components
	const iconMap: Record<string, any> = {
		Zap,
		Sunrise,
		Flame,
		Lightbulb,
		Award,
		Grid3x3,
	};

	function getIconComponent(iconName?: string) {
		if (!iconName) return Sparkles; // Default fallback
		return iconMap[iconName] || Sparkles;
	}

	function handlePresetClick(presetId: string, event: MouseEvent) {
		event.stopPropagation();
		const filters = filterPresets.applyPreset(presetId);
		if (filters) {
			onApplyPreset?.(filters);
		}
	}

	function handleHistoryClick(entry: FilterHistoryEntry, event: MouseEvent) {
		event.stopPropagation();
		onApplyHistory?.(entry.filters);
	}
</script>

<div class="space-y-2">
	<!-- Predefined Presets -->
	<div class="bg-charcoal-900/50 border border-charcoal-800/50 rounded-lg overflow-hidden">
		<button
			onclick={() => presetsExpanded = !presetsExpanded}
			class="w-full flex items-center justify-between p-3 hover:bg-charcoal-800/30 transition-colors"
			aria-expanded={presetsExpanded}
			aria-controls="presets-panel"
		>
			<div class="flex items-center gap-2">
				<Sparkles class="w-4 h-4 text-gold-400" />
				<Typography variant="label" class="text-sm font-medium">
					Quick Filters
				</Typography>
			</div>
			<ChevronDown class="w-4 h-4 transition-transform {presetsExpanded ? 'rotate-180' : ''}" />
		</button>

		{#if presetsExpanded}
			<div id="presets-panel" class="p-3 pt-0" transition:slide={{ duration: 200 }}>
				<div class="grid grid-cols-2 gap-2">
					{#each filterPresets.predefined as preset (preset.id)}
						{@const IconComponent = getIconComponent(preset.iconName)}
						<button
							onclick={(e) => handlePresetClick(preset.id, e)}
							class="flex flex-col items-start gap-1 p-3 rounded-lg border border-charcoal-700 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left"
							aria-label="Apply {preset.name} preset"
						>
							<div class="flex items-center gap-2">
								<IconComponent class="w-4 h-4 text-gold-400" aria-hidden="true" />
								<Typography variant="label" class="text-xs font-medium">
									{preset.name}
								</Typography>
							</div>
							<Typography variant="caption" class="text-xs text-charcoal-400">
								{preset.description}
							</Typography>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Recent History -->
	{#if filterHistory.recent.length > 0}
		<div class="bg-charcoal-900/50 border border-charcoal-800/50 rounded-lg overflow-hidden">
			<button
				onclick={() => historyExpanded = !historyExpanded}
				class="w-full flex items-center justify-between p-3 hover:bg-charcoal-800/30 transition-colors"
				aria-expanded={historyExpanded}
				aria-controls="history-panel"
			>
				<div class="flex items-center gap-2">
					<Clock class="w-4 h-4 text-charcoal-400" />
					<Typography variant="label" class="text-sm font-medium">
						Recent Filters
					</Typography>
					<span class="px-1.5 py-0.5 rounded-full bg-charcoal-800 text-charcoal-400 text-xs">
						{filterHistory.recent.length}
					</span>
				</div>
				<ChevronDown class="w-4 h-4 transition-transform {historyExpanded ? 'rotate-180' : ''}" />
			</button>

			{#if historyExpanded}
				<div id="history-panel" class="p-3 pt-0 space-y-2" transition:slide={{ duration: 200 }}>
					{#each filterHistory.recent as entry (entry.id)}
						<button
							onclick={(e) => handleHistoryClick(entry, e)}
							class="w-full flex items-center justify-between p-2 rounded-lg border border-charcoal-700 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left"
							aria-label="Apply filter: {entry.description}"
						>
							<div class="flex-1 min-w-0">
								<Typography variant="caption" class="text-xs text-charcoal-300 truncate">
									{entry.description}
								</Typography>
								<Typography variant="caption" class="text-xs text-charcoal-500">
									{filterHistory.getRelativeTime(entry.timestamp)}
								</Typography>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
