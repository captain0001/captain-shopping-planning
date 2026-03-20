<script lang="ts">
	import type { HistoryComment } from '$lib/types';

	let {
		historyId,
		comments: initialComments
	}: {
		historyId: number;
		comments: HistoryComment[];
	} = $props();

	let comments = $state(initialComments);
	let newComment = $state('');
	let submitting = $state(false);

	function formatDateTime(dt: string) {
		return new Date(dt).toLocaleString('ja-JP', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function submitComment(e: Event) {
		e.preventDefault();
		if (!newComment.trim()) return;
		submitting = true;

		const res = await fetch(`/api/history/${historyId}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: newComment.trim() })
		});

		if (res.ok) {
			const comment = await res.json() as HistoryComment;
			comments = [...comments, comment];
			newComment = '';
		}
		submitting = false;
	}
</script>

<div class="space-y-4">
	<h3 class="text-sm font-semibold text-gray-700">コメント</h3>

	{#if comments.length === 0}
		<p class="text-sm text-gray-400">コメントはまだありません</p>
	{:else}
		<div class="space-y-3">
			{#each comments as comment (comment.id)}
				<div class="bg-gray-50 rounded-lg p-3">
					<p class="text-sm text-gray-800 whitespace-pre-wrap">{comment.body}</p>
					<p class="mt-1 text-xs text-gray-400">{formatDateTime(comment.created_at)}</p>
				</div>
			{/each}
		</div>
	{/if}

	<form onsubmit={submitComment} class="space-y-2">
		<textarea
			bind:value={newComment}
			rows="2"
			placeholder="補足コメントを追加..."
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
		></textarea>
		<button
			type="submit"
			disabled={submitting || !newComment.trim()}
			class="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
		>コメントを追加</button>
	</form>
</div>
