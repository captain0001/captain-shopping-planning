<script lang="ts">
	import type { HistorySummary } from '$lib/types';

	let { history }: { history: HistorySummary } = $props();

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		});
	}

	function formatDateTime(dt: string) {
		return new Date(dt).toLocaleString('ja-JP', {
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const locationLabel = $derived(
		history.locationNames.length === 0 ? '場所未定' : history.locationNames.join(' · ')
	);
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
	<div class="flex items-start justify-between gap-2">
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-gray-500">{formatDate(history.date)}</span>
				<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">完了</span>
			</div>
			<p class="mt-1 text-base font-semibold text-gray-800 truncate">{locationLabel}</p>
			<p class="mt-0.5 text-sm text-gray-400">{history.locationNames.length} 箇所・{history.totalItems} 品</p>
			<p class="mt-1 text-xs text-gray-400">完了: {formatDateTime(history.completed_at)}</p>
		</div>
		<a href="/history/{history.id}" class="shrink-0 text-sm text-indigo-600 hover:text-indigo-800 font-medium">詳細 →</a>
	</div>
</div>
