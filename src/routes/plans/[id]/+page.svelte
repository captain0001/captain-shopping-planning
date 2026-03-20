<script lang="ts">
	import type { PlanWithLocations, PlanLocationWithItems, PlanItem } from '$lib/types';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let plan = $state(data.plan as PlanWithLocations);
	let locations = $state(plan.locations);

	let editDate = $state(plan.date);
	let editNote = $state(plan.note);
	let editingHeader = $state(false);
	let saving = $state(false);
	let confirmDelete = $state(false);
	let confirmComplete = $state(false);

	// 場所ごとの編集状態
	let editingLocName = $state<Record<number, string>>({});

	// 新規アイテム入力の状態 (locId → {name, quantity})
	let newItemInputs = $state<Record<number, { name: string; quantity: string }>>({});

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		});
	}

	// ヘッダー保存
	async function saveHeader() {
		saving = true;
		const res = await fetch(`/api/plans/${plan.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: editDate, note: editNote })
		});
		if (res.ok) {
			const updated = await res.json();
			plan = { ...plan, ...updated };
			editingHeader = false;
		}
		saving = false;
	}

	// 場所名を保存
	async function saveLocName(loc: PlanLocationWithItems) {
		const name = editingLocName[loc.id] ?? loc.name;
		const res = await fetch(`/api/plans/${plan.id}/locations/${loc.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name })
		});
		if (res.ok) {
			locations = locations.map((l) => (l.id === loc.id ? { ...l, name } : l));
			delete editingLocName[loc.id];
			editingLocName = { ...editingLocName };
		}
	}

	// 場所を追加
	async function addLocation() {
		const res = await fetch(`/api/plans/${plan.id}/locations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: '' })
		});
		if (res.ok) {
			const loc = await res.json() as PlanLocationWithItems;
			locations = [...locations, loc];
			editingLocName = { ...editingLocName, [loc.id]: '' };
		}
	}

	// 場所を削除
	async function deleteLocation(locId: number) {
		const res = await fetch(`/api/plans/${plan.id}/locations/${locId}`, { method: 'DELETE' });
		if (res.ok) {
			locations = locations.filter((l) => l.id !== locId);
		}
	}

	// アイテムをチェック
	async function toggleItem(loc: PlanLocationWithItems, item: PlanItem) {
		const res = await fetch(`/api/plans/${plan.id}/locations/${loc.id}/items/${item.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ toggle: true })
		});
		if (res.ok) {
			const updated = await res.json() as PlanItem;
			locations = locations.map((l) =>
				l.id === loc.id
					? { ...l, items: l.items.map((i) => (i.id === item.id ? updated : i)) }
					: l
			);
		}
	}

	// アイテムを削除
	async function deleteItem(loc: PlanLocationWithItems, itemId: number) {
		const res = await fetch(`/api/plans/${plan.id}/locations/${loc.id}/items/${itemId}`, {
			method: 'DELETE'
		});
		if (res.ok) {
			locations = locations.map((l) =>
				l.id === loc.id ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
			);
		}
	}

	// アイテムを追加
	async function addItem(loc: PlanLocationWithItems) {
		const input = newItemInputs[loc.id];
		if (!input?.name?.trim()) return;

		const res = await fetch(`/api/plans/${plan.id}/locations/${loc.id}/items`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: input.name.trim(), quantity: input.quantity || '1' })
		});
		if (res.ok) {
			const item = await res.json() as PlanItem;
			locations = locations.map((l) =>
				l.id === loc.id ? { ...l, items: [...l.items, item] } : l
			);
			newItemInputs = { ...newItemInputs, [loc.id]: { name: '', quantity: '1' } };
		}
	}

	// 完了
	async function handleComplete() {
		const res = await fetch(`/api/plans/${plan.id}/complete`, { method: 'POST' });
		if (res.ok) {
			const { historyId } = await res.json() as { historyId: number };
			goto(`/history/${historyId}`);
		}
		confirmComplete = false;
	}

	// 削除
	async function handleDelete() {
		const res = await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' });
		if (res.ok) goto('/plans');
		confirmDelete = false;
	}

	const totalItems = $derived(locations.reduce((sum, l) => sum + l.items.length, 0));
	const checkedItems = $derived(locations.reduce((sum, l) => sum + l.items.filter((i) => i.is_checked).length, 0));
</script>

<div class="space-y-5">
	<!-- ヘッダー -->
	<div class="flex items-center gap-3">
		<a href="/plans" class="text-gray-400 hover:text-gray-600 text-sm">← 戻る</a>
		<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
			{plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
			{plan.status === 'completed' ? '完了' : '予定中'}
		</span>
	</div>

	<!-- 予定情報 -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
		{#if editingHeader && plan.status === 'pending'}
			<div class="space-y-3">
				<div>
					<label class="block text-xs font-medium text-gray-500 mb-1">予定日時</label>
					<input type="date" bind:value={editDate} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
				</div>
				<div>
					<label class="block text-xs font-medium text-gray-500 mb-1">備考</label>
					<textarea bind:value={editNote} rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"></textarea>
				</div>
				<div class="flex gap-2">
					<button onclick={() => { editingHeader = false; editDate = plan.date; editNote = plan.note; }}
						class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
						キャンセル
					</button>
					<button onclick={saveHeader} disabled={saving}
						class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
						保存
					</button>
				</div>
			</div>
		{:else}
			<div class="flex items-start justify-between">
				<div>
					<p class="text-sm text-gray-500">{formatDate(plan.date)}</p>
					{#if plan.note}
						<p class="mt-1 text-sm text-gray-500">{plan.note}</p>
					{/if}
					{#if totalItems > 0}
						<p class="mt-1 text-xs text-gray-400">{checkedItems}/{totalItems} チェック済み</p>
					{/if}
				</div>
				{#if plan.status === 'pending'}
					<button onclick={() => (editingHeader = true)} class="text-sm text-indigo-600 hover:text-indigo-800">編集</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- 場所ごとのリスト -->
	{#each locations as loc (loc.id)}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
			<!-- 場所名 -->
			<div class="flex items-center gap-2">
				{#if plan.status === 'pending'}
					<input
						type="text"
						value={editingLocName[loc.id] ?? loc.name}
						oninput={(e) => {
							editingLocName = { ...editingLocName, [loc.id]: (e.target as HTMLInputElement).value };
						}}
						onblur={() => saveLocName(loc)}
						placeholder="場所名（例: スーパー）"
						class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
					/>
					{#if locations.length > 1}
						<button onclick={() => deleteLocation(loc.id)} class="shrink-0 text-gray-300 hover:text-red-400 transition-colors" aria-label="この場所を削除">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				{:else}
					<p class="text-sm font-semibold text-gray-700">{loc.name || '場所未定'}</p>
				{/if}
			</div>

			<!-- アイテム -->
			<div class="space-y-2">
				{#each loc.items as item (item.id)}
					<div class="flex items-center gap-3 p-2 rounded-lg {item.is_checked ? 'bg-gray-50' : ''} border border-gray-100">
						{#if plan.status === 'pending'}
							<button
								onclick={() => toggleItem(loc, item)}
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
								{item.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}">
								{#if item.is_checked}
									<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>
						{/if}
						<span class="flex-1 text-sm {item.is_checked ? 'line-through text-gray-400' : 'text-gray-800'}">{item.name}</span>
						{#if item.quantity && item.quantity !== '1'}
							<span class="text-xs text-gray-400 shrink-0">{item.quantity}</span>
						{/if}
						{#if plan.status === 'pending'}
							<button onclick={() => deleteItem(loc, item.id)} class="shrink-0 text-gray-300 hover:text-red-400 transition-colors" aria-label="削除">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
				{/each}
			</div>

			<!-- アイテム追加フォーム -->
			{#if plan.status === 'pending'}
				<div class="flex gap-2">
					<input
						type="text"
						value={(newItemInputs[loc.id] ?? { name: '' }).name}
						oninput={(e) => {
							const cur = newItemInputs[loc.id] ?? { name: '', quantity: '1' };
							newItemInputs = { ...newItemInputs, [loc.id]: { ...cur, name: (e.target as HTMLInputElement).value } };
						}}
						placeholder="商品名を追加"
						onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(loc); } }}
						class="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
					/>
					<input
						type="text"
						value={(newItemInputs[loc.id] ?? { quantity: '1' }).quantity}
						oninput={(e) => {
							newItemInputs = {
								...newItemInputs,
								[loc.id]: { ...(newItemInputs[loc.id] ?? { name: '', quantity: '1' }), quantity: (e.target as HTMLInputElement).value }
							};
						}}
						placeholder="数量"
						class="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
					/>
					<button
						onclick={() => addItem(loc)}
						disabled={!newItemInputs[loc.id]?.name?.trim()}
						class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
					>追加</button>
				</div>
			{/if}
		</div>
	{/each}

	<!-- 場所を追加 -->
	{#if plan.status === 'pending'}
		<button
			onclick={addLocation}
			class="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
		>+ 場所を追加</button>
	{/if}

	<!-- アクション -->
	{#if plan.status === 'pending'}
		<div class="space-y-3 pt-2">
			<button
				onclick={() => (confirmComplete = true)}
				class="w-full rounded-xl bg-green-500 px-4 py-3 text-base font-semibold text-white hover:bg-green-600 transition-colors shadow-sm"
			>買い物完了にする ✓</button>
			<button
				onclick={() => (confirmDelete = true)}
				class="w-full rounded-xl border border-red-200 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
			>この予定を削除</button>
		</div>
	{/if}
</div>

<!-- 完了確認 -->
{#if confirmComplete}
	<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
			<h3 class="text-base font-bold text-gray-800">買い物を完了にしますか？</h3>
			<p class="text-sm text-gray-500">完了後は編集できません。履歴に移動します。</p>
			<div class="flex gap-3">
				<button onclick={() => (confirmComplete = false)} class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
				<button onclick={handleComplete} class="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">完了にする</button>
			</div>
		</div>
	</div>
{/if}

<!-- 削除確認 -->
{#if confirmDelete}
	<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
			<h3 class="text-base font-bold text-gray-800">予定を削除しますか？</h3>
			<p class="text-sm text-gray-500">この操作は取り消せません。</p>
			<div class="flex gap-3">
				<button onclick={() => (confirmDelete = false)} class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
				<button onclick={handleDelete} class="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">削除する</button>
			</div>
		</div>
	</div>
{/if}
