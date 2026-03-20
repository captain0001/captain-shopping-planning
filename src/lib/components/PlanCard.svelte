<script lang="ts">
	import type { PlanSummary } from '$lib/types';

	let {
		plan,
		onComplete
	}: {
		plan: PlanSummary;
		onComplete?: () => void;
	} = $props();

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		});
	}

	const locationLabel = $derived(
		plan.locationNames.length === 0
			? '場所未定'
			: plan.locationNames.join(' · ')
	);
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
	<div class="flex items-start justify-between gap-2">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-sm font-medium text-gray-500">{formatDate(plan.date)}</span>
				{#if plan.status === 'completed'}
					<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">完了</span>
				{:else}
					<span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">予定中</span>
				{/if}
			</div>
			<p class="mt-1 text-base font-semibold text-gray-800 truncate">{locationLabel}</p>
			<p class="mt-0.5 text-sm text-gray-400">
				{plan.locationNames.length} 箇所・{plan.totalItems} 品
			</p>
			{#if plan.note}
				<p class="mt-1 text-xs text-gray-400 truncate">{plan.note}</p>
			{/if}
		</div>
		<div class="flex flex-col items-end gap-2 shrink-0">
			<a href="/plans/{plan.id}" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">詳細 →</a>
			{#if plan.status === 'pending' && onComplete}
				<button
					onclick={onComplete}
					class="text-xs bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 transition-colors"
				>完了にする</button>
			{/if}
		</div>
	</div>
</div>
