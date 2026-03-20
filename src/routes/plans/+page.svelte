<script lang="ts">
	import type { PlanSummary } from '$lib/types';
	import PlanCard from '$lib/components/PlanCard.svelte';
	import PlanForm from '$lib/components/PlanForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let plans = $state(data.plans as PlanSummary[]);
	let showForm = $state(false);

	const pendingPlans = $derived(plans.filter((p) => p.status === 'pending'));
	const completedPlans = $derived(plans.filter((p) => p.status === 'completed'));

	async function handleCreate(formData: {
		date: string;
		note: string;
		locations: { name: string; items: { name: string; quantity: string }[] }[];
	}) {
		const res = await fetch('/api/plans', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		});
		if (res.ok) {
			const plan = await res.json();
			showForm = false;
			goto(`/plans/${plan.id}`);
		}
	}

	async function handleComplete(plan: PlanSummary) {
		const res = await fetch(`/api/plans/${plan.id}/complete`, { method: 'POST' });
		if (res.ok) {
			const { historyId } = await res.json() as { historyId: number };
			goto(`/history/${historyId}`);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold text-gray-800">買い物予定</h2>
		<button
			onclick={() => (showForm = true)}
			class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
		>+ 新しい予定</button>
	</div>

	{#if pendingPlans.length > 0}
		<section class="space-y-3">
			<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">予定中 ({pendingPlans.length})</h3>
			{#each pendingPlans as plan (plan.id)}
				<PlanCard {plan} onComplete={() => handleComplete(plan)} />
			{/each}
		</section>
	{/if}

	{#if completedPlans.length > 0}
		<section class="space-y-3">
			<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">完了済み ({completedPlans.length})</h3>
			{#each completedPlans as plan (plan.id)}
				<PlanCard {plan} />
			{/each}
		</section>
	{/if}

	{#if plans.length === 0}
		<div class="text-center py-16 text-gray-400">
			<p class="text-4xl mb-3">🛒</p>
			<p class="text-base">予定がまだありません</p>
			<p class="text-sm mt-1">「新しい予定」から作成してください</p>
		</div>
	{/if}
</div>

{#if showForm}
	<PlanForm onSubmit={handleCreate} onCancel={() => (showForm = false)} />
{/if}
