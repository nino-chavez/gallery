<!--
  ConsolidatedFilterImproved Component - Enhanced dropdown with visual hierarchy

  This is an improved version of ConsolidatedFilter with better visual hierarchy
  following Gestalt principles (Law of Proximity, Law of Common Region).

  Use this pattern when:
  - Sidebar layout is not appropriate (e.g., mobile-only pages)
  - Space is constrained
  - Filter count is moderate (<6 filter groups)
  - Quick filter changes are prioritized over discoverability

  Improvements over base ConsolidatedFilter:
  1. Visual separators (horizontal rules) between filter groups
  2. Increased spacing (mb-6) between groups
  3. Bold section titles with distinct color (text-charcoal-100)
  4. Grouped checkboxes with background color (bg-charcoal-800/30)
  5. Two-column layout for long filter lists

  For large filter sets (8+ groups) or primary gallery pages,
  use FilterSidebar instead for better UX.

  Example usage:
  <ConsolidatedFilterImproved
    {sports}
    {categories}
    selectedSport={data.selectedSport}
    onSportSelect={handleSportSelect}
    filterCounts={data.filterCounts}
  />
-->

<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { slide } from 'svelte/transition';
	import { ChevronDown, Trophy, Award, Zap, Activity, Palette, Clock, Frame, Filter } from 'lucide-svelte';
	import { MOTION } from '$lib/motion-tokens';
	import Typography from '$lib/components/ui/Typography.svelte';
	import FilterPill from '$lib/components/ui/FilterPill.svelte';

	interface Sport {
		name: string;
		count: number;
		percentage: number;
	}

	interface Category {
		name: string;
		count: number;
		percentage: number;
	}

	interface Props {
		sports: Sport[];
		categories: Category[];
		selectedSport?: string | null;
		selectedCategory?: string | null;
		selectedPlayType?: string | null;
		selectedIntensity?: string | null;
		selectedLighting?: string[] | null;
		selectedColorTemp?: string | null;
		selectedTimeOfDay?: string | null;
		selectedComposition?: string | null;
		onSportSelect?: (sport: string | null) => void;
		onCategorySelect?: (category: string | null) => void;
		onPlayTypeSelect?: (playType: string | null) => void;
		onIntensitySelect?: (intensity: string | null) => void;
		onLightingSelect?: (lighting: string[] | null) => void;
		onColorTempSelect?: (temp: string | null) => void;
		onTimeOfDaySelect?: (time: string | null) => void;
		onCompositionSelect?: (composition: string | null) => void;
		filterCounts?: {
			sports?: Array<{ name: string; count: number }>;
			categories?: Array<{ name: string; count: number }>;
		};
	}

	let {
		sports,
		categories,
		selectedSport = null,
		selectedCategory = null,
		selectedPlayType = null,
		selectedIntensity = null,
		selectedLighting = null,
		selectedColorTemp = null,
		selectedTimeOfDay = null,
		selectedComposition = null,
		onSportSelect,
		onCategorySelect,
		onPlayTypeSelect,
		onIntensitySelect,
		onLightingSelect,
		onColorTempSelect,
		onTimeOfDaySelect,
		onCompositionSelect,
		filterCounts
	}: Props = $props();

	// Dropdown states
	let primaryExpanded = $state(false);
	let advancedExpanded = $state(false);
	let primaryRef: HTMLDivElement | undefined = $state();
	let advancedRef: HTMLDivElement | undefined = $state();

	// Label mappings
	const compositionLabels: Record<string, string> = {
		rule_of_thirds: 'Rule of Thirds',
		leading_lines: 'Leading Lines',
		centered: 'Centered',
		symmetry: 'Symmetry',
		frame_within_frame: 'Framed',
	};

	const timeOfDayLabels: Record<string, string> = {
		golden_hour: 'Golden Hour',
		midday: 'Midday',
		evening: 'Evening',
		night: 'Night',
	};

	const playTypeLabels: Record<string, string> = {
		attack: 'Attack',
		block: 'Block',
		dig: 'Dig',
		set: 'Set',
		serve: 'Serve',
	};

	const intensityLabels: Record<string, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		peak: 'Peak',
	};

	const lightingLabels: Record<string, string> = {
		natural: 'Natural',
		backlit: 'Backlit',
		dramatic: 'Dramatic',
		soft: 'Soft',
		artificial: 'Artificial',
	};

	const colorTempLabels: Record<string, string> = {
		warm: 'Warm',
		neutral: 'Neutral',
		cool: 'Cool',
	};

	// Merge filterCounts with data
	let sportsWithCounts = $derived(
		sports.map((sport) => {
			const contextCount = filterCounts?.sports?.find((fc) => fc.name === sport.name)?.count;
			return {
				...sport,
				displayCount: contextCount !== undefined ? contextCount : sport.count,
			};
		})
	);

	let categoriesWithCounts = $derived(
		categories.map((category) => {
			const contextCount = filterCounts?.categories?.find((fc) => fc.name === category.name)?.count;
			return {
				...category,
				displayCount: contextCount !== undefined ? contextCount : category.count,
			};
		})
	);

	// Progressive disclosure
	let showAllSports = $state(false);
	let showAllCategories = $state(false);

	// Icon mappings
	const sportIcons: Record<string, any> = {
		volleyball: Trophy,
		basketball: Trophy,
		soccer: Trophy,
		softball: Trophy,
		football: Trophy,
		baseball: Trophy,
		track: Activity,
		portrait: Activity
	};

	const categoryIcons: Record<string, any> = {
		action: Zap,
		celebration: Award,
		candid: Filter,
		portrait: Activity,
		warmup: Activity,
		ceremony: Award
	};

	// Active counts
	const primaryActiveCount = $derived(
		(selectedSport ? 1 : 0) + (selectedCategory ? 1 : 0)
	);

	const advancedActiveCount = $derived(
		(selectedPlayType ? 1 : 0) +
		(selectedIntensity ? 1 : 0) +
		(selectedLighting?.length || 0) +
		(selectedColorTemp ? 1 : 0) +
		(selectedTimeOfDay ? 1 : 0) +
		(selectedComposition ? 1 : 0)
	);

	// Click-outside detection
	function handleClickOutside(event: MouseEvent, dropdownType: 'primary' | 'advanced') {
		const ref = dropdownType === 'primary' ? primaryRef : advancedRef;
		if (ref && !ref.contains(event.target as Node)) {
			if (dropdownType === 'primary') {
				primaryExpanded = false;
			} else {
				advancedExpanded = false;
			}
		}
	}

	$effect(() => {
		if (primaryExpanded) {
			document.addEventListener('click', (e) => handleClickOutside(e, 'primary'));
		} else {
			document.removeEventListener('click', (e) => handleClickOutside(e, 'primary'));
		}

		if (advancedExpanded) {
			document.addEventListener('click', (e) => handleClickOutside(e, 'advanced'));
		} else {
			document.removeEventListener('click', (e) => handleClickOutside(e, 'advanced'));
		}

		return () => {
			document.removeEventListener('click', (e) => handleClickOutside(e, 'primary'));
			document.removeEventListener('click', (e) => handleClickOutside(e, 'advanced'));
		};
	});

	// Filter handlers
	function handleSportClick(sportName: string | null) {
		onSportSelect?.(sportName);
		primaryExpanded = false;
	}

	function handleCategoryClick(categoryName: string | null) {
		onCategorySelect?.(categoryName);
		primaryExpanded = false;
	}

	function handlePlayTypeClick(playType: string | null) {
		onPlayTypeSelect?.(playType);
		advancedExpanded = false;
	}

	function handleIntensityClick(intensity: string | null) {
		onIntensitySelect?.(intensity);
		advancedExpanded = false;
	}

	function handleLightingClick(lighting: string) {
		const current = selectedLighting || [];
		const updated = current.includes(lighting)
			? current.filter(l => l !== lighting)
			: [...current, lighting];
		onLightingSelect?.(updated.length > 0 ? updated : null);
	}

	function handleColorTempClick(temp: string | null) {
		onColorTempSelect?.(temp);
		advancedExpanded = false;
	}

	function handleTimeOfDayClick(time: string | null) {
		onTimeOfDaySelect?.(time);
		advancedExpanded = false;
	}

	function handleCompositionClick(composition: string | null) {
		onCompositionSelect?.(composition);
		advancedExpanded = false;
	}

	const displayedSports = $derived(showAllSports ? sportsWithCounts : sportsWithCounts.slice(0, 5));
	const displayedCategories = $derived(showAllCategories ? categoriesWithCounts : categoriesWithCounts.slice(0, 4));
	const hasMoreSports = $derived(sportsWithCounts.length > 5);
	const hasMoreCategories = $derived(categoriesWithCounts.length > 4);
</script>

<div class="flex flex-wrap items-center gap-2">
	<!-- Primary Filters Dropdown (Sport + Category) with Improved Visual Hierarchy -->
	<div class="relative inline-block" bind:this={primaryRef}>
		<button
			onclick={(e) => {
				e.stopPropagation();
				primaryExpanded = !primaryExpanded;
				advancedExpanded = false;
			}}
			class="px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 {primaryActiveCount > 0
				? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
				: 'bg-charcoal-800/50 border-charcoal-700 hover:border-gold-500/30'}"
			aria-expanded={primaryExpanded}
			aria-label={primaryExpanded ? 'Collapse primary filters' : 'Expand primary filters'}
		>
			<Trophy class="w-3 h-3" />
			<span>Primary</span>
			{#if primaryActiveCount > 0}
				<span class="px-1.5 py-0.5 rounded-full bg-gold-500/30 text-gold-200 text-xs font-medium">{primaryActiveCount}</span>
			{/if}
			<ChevronDown class="w-3 h-3 transition-transform {primaryExpanded ? 'rotate-180' : ''}" />
		</button>

		{#if primaryExpanded}
			<div
				transition:slide
				class="absolute top-full left-0 mt-2 p-5 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-50 min-w-[300px]"
				onclick={(e) => e.stopPropagation()}
			>
				<!-- Sports Section with Visual Hierarchy -->
				<div class="mb-6 pb-6 border-b border-charcoal-800">
					<!-- Bold, distinct title -->
					<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Sports</Typography>

					<!-- Grouped pills with subtle background -->
					<div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
                                                <FilterPill
                                                        label="All"
                                                        count={sports.reduce((sum, s) => sum + s.count, 0)}
                                                        state={!selectedSport ? 'active' : 'available'}
                                                        description="Show all sports"
                                                        size="sm"
                                                        onclick={() => handleSportClick(null)}
                                                />						{#each displayedSports as sport (sport.name)}
							{@const pillIcon = sportIcons[sport.name] || Trophy}
							{@const pillState = selectedSport === sport.name ? 'active' : sport.count === 0 ? 'disabled' : 'available'}

							<FilterPill
								label={sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
								count={sport.count}
								state={pillState}
								description="{sport.name.charAt(0).toUpperCase() + sport.name.slice(1)} photos"
								icon={pillIcon}
								size="sm"
								onclick={() => handleSportClick(sport.name)}
							/>
						{/each}

						{#if hasMoreSports}
							<button
								onclick={() => showAllSports = !showAllSports}
								class="px-3 py-1.5 text-xs rounded-full border border-dashed border-charcoal-700 text-charcoal-400 hover:text-gold-400"
							>
								{showAllSports ? '−' : `+${sports.length - 5}`}
							</button>
						{/if}
					</div>
				</div>

				<!-- Categories Section with Visual Hierarchy -->
				<div>
					<!-- Bold, distinct title -->
					<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Categories</Typography>

					<!-- Grouped pills with subtle background -->
					<div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
                                                <FilterPill
                                                        label="All"
                                                        count={categories.reduce((sum, c) => sum + c.count, 0)}
                                                        state={!selectedCategory ? 'active' : 'available'}
                                                        description="Show all categories"
                                                        size="sm"
                                                        onclick={() => handleCategoryClick(null)}
                                                />						{#each displayedCategories as category (category.name)}
							{@const pillIcon = categoryIcons[category.name] || Award}
							{@const pillState = selectedCategory === category.name ? 'active' : category.count === 0 ? 'disabled' : 'available'}

							<FilterPill
								label={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
								count={category.count}
								state={pillState}
								description="{category.name.charAt(0).toUpperCase() + category.name.slice(1)} photos"
								icon={pillIcon}
								size="sm"
								onclick={() => handleCategoryClick(category.name)}
							/>
						{/each}

						{#if hasMoreCategories}
							<button
								onclick={() => showAllCategories = !showAllCategories}
								class="px-3 py-1.5 text-xs rounded-full border border-dashed border-charcoal-700 text-charcoal-400 hover:text-gold-400"
							>
								{showAllCategories ? '−' : `+${categories.length - 4}`}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Advanced Filters Dropdown with Improved Visual Hierarchy -->
	<div class="relative inline-block" bind:this={advancedRef}>
		<button
			onclick={(e) => {
				e.stopPropagation();
				advancedExpanded = !advancedExpanded;
				primaryExpanded = false;
			}}
			class="px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 {advancedActiveCount > 0
				? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
				: 'bg-charcoal-800/50 border-charcoal-700 hover:border-gold-500/30'}"
			aria-expanded={advancedExpanded}
			aria-label={advancedExpanded ? 'Collapse advanced filters' : 'Expand advanced filters'}
		>
			<Filter class="w-3 h-3" />
			<span>Advanced</span>
			{#if advancedActiveCount > 0}
				<span class="px-1.5 py-0.5 rounded-full bg-gold-500/30 text-gold-200 text-xs font-medium">{advancedActiveCount}</span>
			{/if}
			<ChevronDown class="w-3 h-3 transition-transform {advancedExpanded ? 'rotate-180' : ''}" />
		</button>

		{#if advancedExpanded}
			<div
				transition:slide
				class="absolute top-full left-0 mt-2 p-5 bg-charcoal-900 border border-charcoal-800 rounded-lg shadow-xl z-50 min-w-[320px] max-w-[420px]"
				onclick={(e) => e.stopPropagation()}
			>
				<!-- Two-column layout for better use of space -->
				<div class="grid grid-cols-2 gap-x-4 gap-y-6">
					<!-- Play Type Section -->
					<div class="col-span-1">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Play Type</Typography>
						<div class="flex flex-col gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							<FilterPill
								label="All"
								state={!selectedPlayType ? 'active' : 'available'}
								description="Show all play types"
								size="sm"
								onclick={() => handlePlayTypeClick(null)}
							/>

							{#each Object.entries(playTypeLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedPlayType === key ? 'active' : 'available'}
									description="{label} plays"
									size="sm"
									onclick={() => handlePlayTypeClick(key)}
								/>
							{/each}
						</div>
					</div>

					<!-- Intensity Section -->
					<div class="col-span-1">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Intensity</Typography>
						<div class="flex flex-col gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							<FilterPill
								label="All"
								state={!selectedIntensity ? 'active' : 'available'}
								description="Show all intensity levels"
								size="sm"
								onclick={() => handleIntensityClick(null)}
							/>

							{#each Object.entries(intensityLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedIntensity === key ? 'active' : 'available'}
									description="{label} intensity"
									size="sm"
									onclick={() => handleIntensityClick(key)}
								/>
							{/each}
						</div>
					</div>

					<!-- Lighting Section (Multi-select) - Full width -->
					<div class="col-span-2 pb-6 border-b border-charcoal-800">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Lighting (Multi-select)</Typography>
						<div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							{#each Object.entries(lightingLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedLighting?.includes(key) ? 'active' : 'available'}
									description="{label} lighting"
									size="sm"
									onclick={() => handleLightingClick(key)}
								/>
							{/each}
						</div>
					</div>

					<!-- Color Temperature Section -->
					<div class="col-span-1">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Color Temp</Typography>
						<div class="flex flex-col gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							<FilterPill
								label="All"
								state={!selectedColorTemp ? 'active' : 'available'}
								description="Show all color temperatures"
								size="sm"
								onclick={() => handleColorTempClick(null)}
							/>

							{#each Object.entries(colorTempLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedColorTemp === key ? 'active' : 'available'}
									description="{label} color temperature"
									size="sm"
									onclick={() => handleColorTempClick(key)}
								/>
							{/each}
						</div>
					</div>

					<!-- Time of Day Section -->
					<div class="col-span-1">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Time of Day</Typography>
						<div class="flex flex-col gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							<FilterPill
								label="All"
								state={!selectedTimeOfDay ? 'active' : 'available'}
								description="Show all times of day"
								size="sm"
								onclick={() => handleTimeOfDayClick(null)}
							/>

							{#each Object.entries(timeOfDayLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedTimeOfDay === key ? 'active' : 'available'}
									description="Photos taken during {label.toLowerCase()}"
									size="sm"
									onclick={() => handleTimeOfDayClick(key)}
								/>
							{/each}
						</div>
					</div>

					<!-- Composition Section - Full width -->
					<div class="col-span-2 pt-6 border-t border-charcoal-800">
						<Typography variant="label" class="text-charcoal-100 text-sm font-semibold mb-3 block">Composition</Typography>
						<div class="flex flex-wrap gap-2 p-3 bg-charcoal-800/30 rounded-lg">
							<FilterPill
								label="All"
								state={!selectedComposition ? 'active' : 'available'}
								description="Show all compositions"
								size="sm"
								onclick={() => handleCompositionClick(null)}
							/>

							{#each Object.entries(compositionLabels) as [key, label] (key)}
								<FilterPill
									label={label}
									state={selectedComposition === key ? 'active' : 'available'}
									description="{label} composition"
									size="sm"
									onclick={() => handleCompositionClick(key)}
								/>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
