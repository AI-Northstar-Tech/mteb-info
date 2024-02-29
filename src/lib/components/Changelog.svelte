<script>
	import Table from './Table.svelte';
	export let data = [];
	export let showSlug = false;

	let tableData;

	$: {
		const tableDataInit = {
			headers: ['Type', 'Model', 'Rank', 'Date'],
			data: []
		};
		if (showSlug) tableDataInit.headers.push('Catagory');
		data.forEach((item) => {
			const typeHtml = `<p class="${item.type === '+' ? 'text-green-500' : 'text-red-500'}">${
				item.type
			}</p>`;
			const modelATag = `<a href="${item.model.url}" class="underline">${item.model.name}</a>`;
			const date = item.time.split('T')[0];
			const slugATag = `<a href="/${item.slug}" class="underline">${item.slug}</a>`;
			const rowData = [typeHtml, modelATag, item.rank ?? '', date];
			if (showSlug) rowData.push(slugATag);
			tableDataInit.data.push(rowData);
		});
		tableData = tableDataInit;
	}
</script>

<div>
	{#if data.length > 0}
		<Table data={tableData} />
	{:else}
		<div class="border dark:border-gray-700 border-0.5 rounded text-center p-2">
			No Changelog Found
		</div>
	{/if}
</div>
