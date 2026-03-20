<script lang="ts">
	import type { PlanItem } from '$lib/types';

	let {
		items,
		planId,
		readonly = false,
		onItemsChange
	}: {
		items: PlanItem[];
		planId: number;
		readonly?: boolean;
		onItemsChange?: (items: PlanItem[]) => void;
	} = $props();

	let newName = $state('');
	let newQuantity = $state('1');
	let adding = $state(false);

	async function toggleItem(item: PlanItem) {
		const res = await fetch(`/api/plans/${planId}/items/${item.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ toggle: true })
		});
		if (res.ok) {
			const updated = await res.json() as PlanItem;
			onItemsChange?.(items.map((i) => (i.id === item.id ? updated : i)));
		}
	}

	async function deleteItem(item: PlanItem) {
		const res = await fetch(`/api/plans/${planId}/items/${item.id}`, { method: 'DELETE' });
		if (res.ok) {
			onItemsChange?.(items.filter((i) => i.id !== item.id));
		}
	}

	async function addItem(e: Event) {
		e.preventDefault();
		if (!newName.trim()) return;
		adding = true;

		const res = await fetch(`/api/plans/${planId}/items`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newName.trim(), quantity: newQuantity || '1' })
		});

		if (res.ok) {
			const item = await res.json() as PlanItem;
			onItemsChange?.([...items, item]);
			newName = '';
			newQuantity = '1';
		}
		adding = false;
	}
</script>

<div class="space-y-2">
	{#each items as item (item.id)}
		<div class="flex items-center gap-3 p-2 rounded-lg {item.is_checked ? 'bg-gray-50' : 'bg-white'} border border-gray-100">
			{#if !readonly}
				<button
					onclick={() => toggleItem(item)}
					class="shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
						{item.is_checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-400'}"
					aria-label="チェック切替"
				>
					{#if item.is_checked}
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
			{:else}
				<div class="shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
					{item.was_checked ?? item.is_checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}">
					{#if item.was_checked ?? item.is_checked}
						<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</div>
			{/if}
			<div class="flex-1 min-w-0">
				<span class="text-sm {item.is_checked ? 'line-through text-gray-400' : 'text-gray-800'}">{item.name}</span>
				{#if item.quantity && item.quantity !== '1'}
					<span class="ml-2 text-xs text-gray-400">{item.quantity}</span>
				{/if}
			</div>
			{#if !readonly}
				<button
					onclick={() => deleteItem(item)}
					class="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
					aria-label="削除"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	{/each}

	{#if !readonly}
		<form onsubmit={addItem} class="flex gap-2 mt-3">
			<input
				type="text"
				bind:value={newName}
				placeholder="商品名を追加"
				class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
			/>
			<input
				type="text"
				bind:value={newQuantity}
				placeholder="数量"
				class="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
			/>
			<button
				type="submit"
				disabled={adding || !newName.trim()}
				class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
			>追加</button>
		</form>
	{/if}
</div>
