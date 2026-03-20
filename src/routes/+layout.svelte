<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow-sm">
		<div class="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
			<h1 class="text-lg font-bold text-gray-800">🛒 買い物計画</h1>
			<nav class="flex gap-1 text-sm">
				<a
					href="/plans"
					class="rounded px-3 py-1 {$page.url.pathname.startsWith('/plans') ? 'bg-indigo-100 font-medium text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}"
				>予定</a>
				<a
					href="/history"
					class="rounded px-3 py-1 {$page.url.pathname.startsWith('/history') ? 'bg-indigo-100 font-medium text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}"
				>履歴</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-4 py-6">
		{@render children()}
	</main>
</div>
