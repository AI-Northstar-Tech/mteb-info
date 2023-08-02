<script>
	import Table from '$lib/components/Table.svelte';
	export let data;
	console.log(data);
</script>

<div>
	{@html data.headerHtml}
	<div class="flex flex-wrap mt-4">
		{#each data.primaryTabs as primaryTabs}
			<a href={`/${encodeURI(primaryTabs.name)}`}>
				<div
					class={`px-3 py-2 text-gray-400 translate-y-[0.115rem] ${
						primaryTabs.active
							? 'border border-2 border-b-0 rounded-t-lg !text-gray-900 bg-white'
							: ''
					}`}
				>
					{primaryTabs.name}
				</div>
			</a>
		{/each}
	</div>
	<div class="border border-2 rounded-b-lg">
		<div class="p-2">
			{#if data.secondaryTabs.length > 0}
				<div class="flex flex-wrap mt-4">
					{#each data.secondaryTabs as secondaryTabs}
						<a href={`/${encodeURI(data.activePrimaryTabName)}/${encodeURI(secondaryTabs.name)}`}>
							<div
								class={`px-3 py-2 text-gray-400 bg-white ${
									secondaryTabs.active
										? 'border border-2 border-b-0 rounded-t-lg translate-y-[0.115rem] !text-gray-900'
										: ''
								}`}
							>
								{secondaryTabs.name}
							</div>
						</a>
					{/each}
				</div>
				<div class="p-2 border border-2 rounded-b-lg">
					{@html data.tableData.html}
					<Table data={data.tableData} />
				</div>
			{:else}
				<div>
					{@html data.tableData.html}
					<Table data={data.tableData} />
				</div>
				<div class="" />
			{/if}
		</div>
	</div>
</div>
