<script>
	import TableGroup from '$lib/components/TableGroup.svelte';
	export let data;
</script>

<div>
	<div class="text-xl">Changelog:</div>
	<TableGroup {data}/>
	<div class="pt-6">
		<p>View <a class="text-blue-500 underline" href="/">rankings</a></p>
		<p>
			To make corrections and improvements to the page, please send a PR to <a
				class="text-blue-500"
				href="https://github.com/AI-Northstar-Tech/mteb-info/tree/main"
				>https://github.com/AI-Northstar-Tech/mteb-info/tree/main</a
			>.
		</p>
	</div>
</div>
