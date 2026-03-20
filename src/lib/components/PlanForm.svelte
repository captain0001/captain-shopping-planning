<script lang="ts">
	type ItemDraft = { name: string; quantity: string };
	type LocationDraft = { name: string; items: ItemDraft[] };

	let {
		onSubmit,
		onCancel
	}: {
		onSubmit: (data: { date: string; note: string; locations: LocationDraft[] }) => void;
		onCancel: () => void;
	} = $props();

	let date = $state(new Date().toISOString().slice(0, 10));
	let note = $state('');
	let locations = $state<LocationDraft[]>([{ name: '', items: [] }]);

	function addLocation() {
		locations = [...locations, { name: '', items: [] }];
	}

	function removeLocation(i: number) {
		locations = locations.filter((_, idx) => idx !== i);
	}

	function addItem(locIdx: number) {
		locations = locations.map((loc, i) =>
			i === locIdx ? { ...loc, items: [...loc.items, { name: '', quantity: '1' }] } : loc
		);
	}

	function removeItem(locIdx: number, itemIdx: number) {
		locations = locations.map((loc, i) =>
			i === locIdx
				? { ...loc, items: loc.items.filter((_, j) => j !== itemIdx) }
				: loc
		);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!date) return;
		// 空の場所は除外
		const cleaned = locations
			.filter((loc) => loc.name.trim() || loc.items.some((it) => it.name.trim()))
			.map((loc) => ({
				name: loc.name.trim(),
				items: loc.items.filter((it) => it.name.trim()).map((it) => ({
					name: it.name.trim(),
					quantity: it.quantity.trim() || '1'
				}))
			}));
		onSubmit({ date, note: note.trim(), locations: cleaned });
	}
</script>

<div class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
	<div class="bg-white rounded-xl shadow-xl w-full max-w-lg my-4">
		<div class="p-5">
			<h2 class="text-lg font-bold text-gray-800 mb-5">新しい予定を作成</h2>
			<form onsubmit={handleSubmit} class="space-y-5">

				<!-- 日付 -->
				<div>
					<label for="date" class="block text-sm font-medium text-gray-700 mb-1">
						予定日時 <span class="text-red-500">*</span>
					</label>
					<input
						id="date"
						type="date"
						bind:value={date}
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
					/>
				</div>

				<!-- 備考 -->
				<div>
					<label for="note" class="block text-sm font-medium text-gray-700 mb-1">備考</label>
					<textarea
						id="note"
						bind:value={note}
						rows="2"
						placeholder="任意のメモ"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
					></textarea>
				</div>

				<!-- 場所リスト -->
				<div class="space-y-3">
					<p class="text-sm font-medium text-gray-700">場所と買い物リスト</p>

					{#each locations as loc, locIdx (locIdx)}
						<div class="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
							<!-- 場所名 -->
							<div class="flex items-center gap-2">
								<span class="text-xs font-semibold text-gray-400 shrink-0">場所 {locIdx + 1}</span>
								<input
									type="text"
									bind:value={loc.name}
									placeholder="店舗名（例: スーパー）"
									class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
								/>
								{#if locations.length > 1}
									<button
										type="button"
										onclick={() => removeLocation(locIdx)}
										class="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
										aria-label="この場所を削除"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								{/if}
							</div>

							<!-- アイテムリスト -->
							{#if loc.items.length > 0}
								<div class="space-y-2">
									{#each loc.items as item, itemIdx (itemIdx)}
										<div class="flex items-center gap-2">
											<input
												type="text"
												bind:value={item.name}
												placeholder="商品名"
												class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
											/>
											<input
												type="text"
												bind:value={item.quantity}
												placeholder="数量"
												class="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
											/>
											<button
												type="button"
												onclick={() => removeItem(locIdx, itemIdx)}
												class="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
												aria-label="アイテムを削除"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									{/each}
								</div>
							{/if}

							<!-- アイテム追加 -->
							<button
								type="button"
								onclick={() => addItem(locIdx)}
								class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
							>+ アイテムを追加</button>
						</div>
					{/each}

					<!-- 場所を追加 -->
					<button
						type="button"
						onclick={addLocation}
						class="w-full rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
					>+ 場所を追加</button>
				</div>

				<!-- ボタン -->
				<div class="flex gap-3 pt-1">
					<button
						type="button"
						onclick={onCancel}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
					>キャンセル</button>
					<button
						type="submit"
						class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
					>作成</button>
				</div>
			</form>
		</div>
	</div>
</div>
