<!--
  FilterSidebar Component - Faceted filter sidebar with accordion sections

  Implements best-practice filter UI for large galleries:
  - Accordion sections (progressive disclosure)
  - Checkboxes for multi-select filters
  - Dynamic result counts (context-aware)
  - Visual hierarchy (Law of Proximity, Law of Common Region)
  - Desktop-optimized (mobile uses FilterSidebarDrawer)

  Features:
  - Sport, Category, Play Type, Intensity, Lighting (multi-select)
  - Color Temperature, Time of Day, Composition
  - Smart filter counts showing compatible results
  - Disabled state for zero-result options
  - Sticky positioning with scroll
  - Clear all functionality

  Usage:
  <FilterSidebar
    {sports}
    {categories}
    {filterCounts}
    selectedSport={data.selectedSport}
    selectedCategory={data.selectedCategory}
    selectedPlayType={data.selectedPlayType}
    selectedIntensity={data.selectedIntensity}
    selectedLighting={data.selectedLighting}
    selectedColorTemp={data.selectedColorTemp}
    selectedTimeOfDay={data.selectedTimeOfDay}
    selectedComposition={data.selectedComposition}
    onSportSelect={handleSportSelect}
    onCategorySelect={handleCategorySelect}
    onPlayTypeSelect={handlePlayTypeSelect}
    onIntensitySelect={handleIntensitySelect}
    onLightingSelect={handleLightingSelect}
    onColorTempSelect={handleColorTempSelect}
    onTimeOfDaySelect={handleTimeOfDaySelect}
    onCompositionSelect={handleCompositionSelect}
    onClearAll={handleClearAll}
  />
-->

<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown, X, Trophy, Award, Zap, Palette, Clock, Frame, Activity, Sparkles } from 'lucide-svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import type { FilterCounts } from '$lib/supabase/server';

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
		onClearAll?: () => void;
		filterCounts?: FilterCounts;
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
		onClearAll,
		filterCounts
	}: Props = $props();

	// Accordion state - Start with primary filters expanded
	let expandedSections = $state({
		sport: true,
		category: true,
		playType: false,
		intensity: false,
		lighting: false,
		colorTemp: false,
		timeOfDay: false,
		composition: false
	});

	// Label mappings for user-friendly display
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

	const timeOfDayLabels: Record<string, string> = {
		golden_hour: 'Golden Hour',
		midday: 'Midday',
		evening: 'Evening',
		night: 'Night',
	};

	const compositionLabels: Record<string, string> = {
		rule_of_thirds: 'Rule of Thirds',
		leading_lines: 'Leading Lines',
		centered: 'Centered',
		symmetry: 'Symmetry',
		frame_within_frame: 'Framed',
	};

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
		candid: Sparkles,
		portrait: Activity,
		warmup: Activity,
		ceremony: Award
	};

	// Merge filterCounts with data for context-aware counts
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

	// Calculate active filter count
	let activeFilterCount = $derived(
		(selectedSport ? 1 : 0) +
		(selectedCategory ? 1 : 0) +
		(selectedPlayType ? 1 : 0) +
		(selectedIntensity ? 1 : 0) +
		(selectedLighting?.length || 0) +
		(selectedColorTemp ? 1 : 0) +
		(selectedTimeOfDay ? 1 : 0) +
		(selectedComposition ? 1 : 0)
	);

	// Toggle accordion section
	function toggleSection(section: keyof typeof expandedSections) {
		expandedSections[section] = !expandedSections[section];
	}

	// Filter handlers
	function handleSportClick(sportName: string | null, event: Event) {
		event.stopPropagation();
		onSportSelect?.(sportName);
	}

	function handleCategoryClick(categoryName: string | null, event: Event) {
		event.stopPropagation();
		onCategorySelect?.(categoryName);
	}

	function handlePlayTypeClick(playType: string | null, event: Event) {
		event.stopPropagation();
		onPlayTypeSelect?.(playType);
	}

	function handleIntensityClick(intensity: string | null, event: Event) {
		event.stopPropagation();
		onIntensitySelect?.(intensity);
	}

	function handleLightingClick(lighting: string, event: Event) {
		event.stopPropagation();
		const current = selectedLighting || [];
		const updated = current.includes(lighting)
			? current.filter(l => l !== lighting)
			: [...current, lighting];
		onLightingSelect?.(updated.length > 0 ? updated : null);
	}

	function handleColorTempClick(temp: string | null, event: Event) {
		event.stopPropagation();
		onColorTempSelect?.(temp);
	}

	function handleTimeOfDayClick(time: string | null, event: Event) {
		event.stopPropagation();
		onTimeOfDaySelect?.(time);
	}

	function handleCompositionClick(composition: string | null, event: Event) {
		event.stopPropagation();
		onCompositionSelect?.(composition);
	}

	function handleClearAllClick(event: Event) {
		event.stopPropagation();
		onClearAll?.();
	}	// Get count for filter option
	function getPlayTypeCount(playType: string): number {
		return filterCounts?.playTypes?.find(pt => pt.name === playType)?.count || 0;
	}

	function getIntensityCount(intensity: string): number {
		return filterCounts?.intensities?.find(i => i.name === intensity)?.count || 0;
	}

	function getLightingCount(lighting: string): number {
		return filterCounts?.lighting?.find(l => l.name === lighting)?.count || 0;
	}

	function getColorTempCount(temp: string): number {
		return filterCounts?.colorTemperatures?.find(ct => ct.name === temp)?.count || 0;
	}

	function getTimeOfDayCount(time: string): number {
		return filterCounts?.timesOfDay?.find(t => t.name === time)?.count || 0;
	}

	function getCompositionCount(composition: string): number {
		return filterCounts?.compositions?.find(c => c.name === composition)?.count || 0;
	}
</script>

<aside class="w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
	<div class="bg-charcoal-900/50 border border-charcoal-800/50 rounded-xl p-4 space-y-1">
		<!-- Header with Clear All -->
		<div class="flex items-center justify-between mb-4 pb-3 border-b border-charcoal-800/50">
			<Typography variant="h3" class="text-base font-semibold">Filters</Typography>
			{#if activeFilterCount > 0}
				<button
					onclick={handleClearAllClick}
					class="flex items-center gap-1 px-2 py-1 text-xs text-charcoal-400 hover:text-gold-400 transition-colors"
					aria-label="Clear all filters"
				>
					<X class="w-3 h-3" />
					<span>Clear All</span>
				</button>
			{/if}
		</div>

		<!-- Sport Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('sport')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.sport}
				aria-controls="sport-section"
			>
				<span class="flex items-center gap-2">
					<Trophy class="w-4 h-4" />
					Sport
					{#if selectedSport}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.sport ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.sport}
				<div id="sport-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Sports -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="sport"
							checked={!selectedSport}
							onchange={(e) => handleSportClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedSport ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Sports</span>
						<span class="text-xs text-charcoal-500">{sportsWithCounts.reduce((sum, s) => sum + s.displayCount, 0).toLocaleString()}</span>
					</label>

					<!-- Individual Sports -->
					{#each sportsWithCounts as sport (sport.name)}
						{@const IconComponent = sportIcons[sport.name.toLowerCase()] || Trophy}
						{@const isDisabled = sport.displayCount === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="sport"
								checked={selectedSport === sport.name}
								onchange={(e) => handleSportClick(sport.name, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<IconComponent class="w-3.5 h-3.5 {selectedSport === sport.name ? 'text-gold-400' : 'text-charcoal-500'}" />
							<span class="flex-1 text-sm capitalize {selectedSport === sport.name ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">
								{sport.name}
							</span>
							<span class="text-xs text-charcoal-500">{sport.displayCount.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Category Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('category')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.category}
				aria-controls="category-section"
			>
				<span class="flex items-center gap-2">
					<Award class="w-4 h-4" />
					Category
					{#if selectedCategory}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.category ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.category}
				<div id="category-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Categories -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="category"
							checked={!selectedCategory}
							onchange={(e) => handleCategoryClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedCategory ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Categories</span>
						<span class="text-xs text-charcoal-500">{categoriesWithCounts.reduce((sum, c) => sum + c.displayCount, 0).toLocaleString()}</span>
					</label>

					<!-- Individual Categories -->
					{#each categoriesWithCounts as category (category.name)}
						{@const IconComponent = categoryIcons[category.name.toLowerCase()] || Award}
						{@const isDisabled = category.displayCount === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="category"
								checked={selectedCategory === category.name}
								onchange={(e) => handleCategoryClick(category.name, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<IconComponent class="w-3.5 h-3.5 {selectedCategory === category.name ? 'text-gold-400' : 'text-charcoal-500'}" />
							<span class="flex-1 text-sm capitalize {selectedCategory === category.name ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">
								{category.name}
							</span>
							<span class="text-xs text-charcoal-500">{category.displayCount.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Play Type Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('playType')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.playType}
				aria-controls="playtype-section"
			>
				<span class="flex items-center gap-2">
					<Zap class="w-4 h-4" />
					Play Type
					{#if selectedPlayType}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.playType ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.playType}
				<div id="playtype-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Play Types -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="playtype"
							checked={!selectedPlayType}
							onchange={(e) => handlePlayTypeClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedPlayType ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Types</span>
					</label>

					<!-- Individual Play Types -->
					{#each Object.entries(playTypeLabels) as [key, label] (key)}
						{@const count = getPlayTypeCount(key)}
						{@const isDisabled = count === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="playtype"
								checked={selectedPlayType === key}
								onchange={(e) => handlePlayTypeClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<span class="flex-1 text-sm {selectedPlayType === key ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Action Intensity Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('intensity')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.intensity}
				aria-controls="intensity-section"
			>
				<span class="flex items-center gap-2">
					<Activity class="w-4 h-4" />
					Intensity
					{#if selectedIntensity}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.intensity ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.intensity}
				<div id="intensity-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Intensities -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="intensity"
							checked={!selectedIntensity}
							onchange={(e) => handleIntensityClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedIntensity ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Levels</span>
					</label>

					<!-- Individual Intensities -->
					{#each Object.entries(intensityLabels) as [key, label] (key)}
						{@const count = getIntensityCount(key)}
						{@const isDisabled = count === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="intensity"
								checked={selectedIntensity === key}
								onchange={(e) => handleIntensityClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<span class="flex-1 text-sm {selectedIntensity === key ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Lighting Section (Multi-select) -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('lighting')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.lighting}
				aria-controls="lighting-section"
			>
				<span class="flex items-center gap-2">
					<Palette class="w-4 h-4" />
					Lighting
					{#if selectedLighting && selectedLighting.length > 0}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">{selectedLighting.length}</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.lighting ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.lighting}
				<div id="lighting-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					{#each Object.entries(lightingLabels) as [key, label] (key)}
						{@const count = getLightingCount(key)}
						{@const isDisabled = count === 0}
						{@const isChecked = selectedLighting?.includes(key) || false}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="checkbox"
								checked={isChecked}
								onchange={(e) => handleLightingClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900 rounded"
							/>
							<span class="flex-1 text-sm {isChecked ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Color Temperature Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('colorTemp')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.colorTemp}
				aria-controls="colortemp-section"
			>
				<span class="flex items-center gap-2">
					<Palette class="w-4 h-4" />
					Color Temp
					{#if selectedColorTemp}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.colorTemp ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.colorTemp}
				<div id="colortemp-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Color Temps -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="colortemp"
							checked={!selectedColorTemp}
							onchange={(e) => handleColorTempClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedColorTemp ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Temps</span>
					</label>

					<!-- Individual Color Temps -->
					{#each Object.entries(colorTempLabels) as [key, label] (key)}
						{@const count = getColorTempCount(key)}
						{@const isDisabled = count === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="colortemp"
								checked={selectedColorTemp === key}
								onchange={(e) => handleColorTempClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<span class="flex-1 text-sm {selectedColorTemp === key ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Time of Day Section -->
		<div class="border-b border-charcoal-800/30 pb-3">
			<button
				onclick={() => toggleSection('timeOfDay')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.timeOfDay}
				aria-controls="timeofday-section"
			>
				<span class="flex items-center gap-2">
					<Clock class="w-4 h-4" />
					Time of Day
					{#if selectedTimeOfDay}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.timeOfDay ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.timeOfDay}
				<div id="timeofday-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Times -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="timeofday"
							checked={!selectedTimeOfDay}
							onchange={(e) => handleTimeOfDayClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedTimeOfDay ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Times</span>
					</label>

					<!-- Individual Times -->
					{#each Object.entries(timeOfDayLabels) as [key, label] (key)}
						{@const count = getTimeOfDayCount(key)}
						{@const isDisabled = count === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="timeofday"
								checked={selectedTimeOfDay === key}
								onchange={(e) => handleTimeOfDayClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<span class="flex-1 text-sm {selectedTimeOfDay === key ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Composition Section -->
		<div class="pb-3">
			<button
				onclick={() => toggleSection('composition')}
				class="w-full flex items-center justify-between py-2 text-sm font-medium hover:text-gold-400 transition-colors"
				aria-expanded={expandedSections.composition}
				aria-controls="composition-section"
			>
				<span class="flex items-center gap-2">
					<Frame class="w-4 h-4" />
					Composition
					{#if selectedComposition}
						<span class="px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 text-xs">1</span>
					{/if}
				</span>
				<ChevronDown class="w-4 h-4 transition-transform {expandedSections.composition ? 'rotate-180' : ''}" />
			</button>

			{#if expandedSections.composition}
				<div id="composition-section" class="space-y-1 mt-2" transition:slide={{ duration: 200 }}>
					<!-- All Compositions -->
					<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors">
						<input
							type="radio"
							name="composition"
							checked={!selectedComposition}
							onchange={(e) => handleCompositionClick(null, e)}
							class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
						/>
						<span class="flex-1 text-sm {!selectedComposition ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">All Styles</span>
					</label>

					<!-- Individual Compositions -->
					{#each Object.entries(compositionLabels) as [key, label] (key)}
						{@const count = getCompositionCount(key)}
						{@const isDisabled = count === 0}
						<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-charcoal-800/50 cursor-pointer transition-colors {isDisabled ? 'opacity-40 cursor-not-allowed' : ''}">
							<input
								type="radio"
								name="composition"
								checked={selectedComposition === key}
								onchange={(e) => handleCompositionClick(key, e)}
								disabled={isDisabled}
								class="w-4 h-4 text-gold-500 border-charcoal-700 focus:ring-gold-500 focus:ring-offset-charcoal-900"
							/>
							<span class="flex-1 text-sm {selectedComposition === key ? 'text-gold-400 font-medium' : 'text-charcoal-300'}">{label}</span>
							<span class="text-xs text-charcoal-500">{count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</aside>

<style>
	/* Custom radio/checkbox styling */
	input[type="radio"],
	input[type="checkbox"] {
		accent-color: #d4a025; /* gold-500 */
	}

	/* Smooth transitions */
	button,
	label {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Custom scrollbar for sidebar */
	aside {
		scrollbar-width: thin;
		scrollbar-color: #374151 transparent; /* charcoal-700 */
	}

	aside::-webkit-scrollbar {
		width: 6px;
	}

	aside::-webkit-scrollbar-track {
		background: transparent;
	}

	aside::-webkit-scrollbar-thumb {
		background: #374151; /* charcoal-700 */
		border-radius: 3px;
	}

	aside::-webkit-scrollbar-thumb:hover {
		background: #4b5563; /* charcoal-600 */
	}
</style>
