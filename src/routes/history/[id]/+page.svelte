<script lang="ts">
	import type { HistoryDetail, HistoryItem } from '$lib/types';
	import CommentThread from '$lib/components/CommentThread.svelte';

	let { data } = $props();
	const history = data.history as HistoryDetail;

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
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const totalItems = history.locations.reduce((sum, l) => sum + l.items.length, 0);
	const checkedItems = history.locations.reduce(
		(sum, l) => sum + l.items.filter((i: HistoryItem) => i.was_checked).length,
		0
	);
</script>

<div class="space-y-5">
	<!-- ヘッダー -->
	<div class="flex items-center gap-3">
		<a href="/history" class="text-gray-400 hover:text-gray-600 text-sm">← 戻る</a>
		<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">完了</span>
	</div>

	<!-- 履歴情報 -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
		<p class="text-sm text-gray-500">{formatDate(history.date)}</p>
		{#if history.note}
			<p class="mt-1 text-sm text-gray-500">{history.note}</p>
		{/if}
		<p class="mt-1 text-xs text-gray-400">{checkedItems}/{totalItems} 購入済み</p>
		<p class="mt-1 text-xs text-gray-400">完了日時: {formatDateTime(history.completed_at)}</p>
	</div>

	<!-- 場所ごとのリスト (読み取り専用) -->
	{#each history.locations as loc (loc.id)}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
			<p class="text-sm font-semibold text-gray-700">{loc.name || '場所未定'}</p>

			{#if loc.items.length === 0}
				<p class="text-sm text-gray-400">アイテムなし</p>
			{:else}
				<div class="space-y-2">
					{#each loc.items as item (item.id)}
						<div class="flex items-center gap-3 p-2 rounded-lg {item.was_checked ? 'bg-gray-50' : ''} border border-gray-100">
							<div class="shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
								{item.was_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}">
								{#if item.was_checked}
									<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>
							<span class="flex-1 text-sm {item.was_checked ? 'line-through text-gray-400' : 'text-gray-800'}">{item.name}</span>
							{#if item.quantity && item.quantity !== '1'}
								<span class="text-xs text-gray-400 shrink-0">{item.quantity}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<!-- コメント -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
		<CommentThread historyId={history.id} comments={history.comments} />
	</div>
</div>
