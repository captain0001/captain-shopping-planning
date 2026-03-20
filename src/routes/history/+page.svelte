<script lang="ts">
	import type { HistorySummary } from '$lib/types';
	import HistoryCard from '$lib/components/HistoryCard.svelte';

	let { data } = $props();
	const histories = data.histories as HistorySummary[];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold text-gray-800">買い物履歴</h2>
		<span class="text-sm text-gray-400">{histories.length} 件</span>
	</div>

	{#if histories.length === 0}
		<div class="text-center py-16 text-gray-400">
			<p class="text-4xl mb-3">📋</p>
			<p class="text-base">履歴はまだありません</p>
			<p class="text-sm mt-1">買い物を完了にすると履歴に追加されます</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each histories as history (history.id)}
				<HistoryCard {history} />
			{/each}
		</div>
	{/if}
</div>
