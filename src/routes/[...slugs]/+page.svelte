<script>
	import Table from '$lib/components/Table.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	export let data;
</script>

<div>
	<div class="fixed top-2 right-4 md:right-[10%] z-50">
		<ThemeSwitch />
	</div>
	{@html data.headerHtml}
	<div class="flex flex-wrap mt-4">
		{#each data.primaryTabs as primaryTabs}
			<a href={`/${encodeURI(primaryTabs.name)}`} data-sveltekit-noscroll>
				<div
					class={`px-3 py-2 text-gray-400 translate-y-[0.115rem] ${
						primaryTabs.active
							? 'border dark:border-gray-700 border-2 border-b-0 rounded-t-lg !text-gray-900 dark:!text-gray-300 bg-white dark:bg-gray-900'
							: ''
					}`}
				>
					{primaryTabs.name}
				</div>
			</a>
		{/each}
	</div>
	<div class="border dark:border-gray-700 border-2 rounded-b-lg">
		<div class="p-2">
			{#if data.secondaryTabs.length > 0}
				<div class="flex flex-wrap mt-4">
					{#each data.secondaryTabs as secondaryTabs}
						<a
							href={`/${encodeURI(data.activePrimaryTabName)}/${encodeURI(secondaryTabs.name)}`}
							data-sveltekit-noscroll
						>
							<div
								class={`px-3 py-2 text-gray-400 bg-white dark:bg-gray-900 ${
									secondaryTabs.active
										? 'border dark:border-gray-700 border-2 border-b-0 rounded-t-lg translate-y-[0.115rem] !text-gray-900 dark:!text-gray-300'
										: ''
								}`}
							>
								{secondaryTabs.name}
							</div>
						</a>
					{/each}
				</div>
				<div class="p-2 border dark:border-gray-700 border-2 rounded-b-lg">
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
	<div class="pt-6">
		<p>
			To make corrections and improvements to the page, please send a PR to <a
				class="text-blue-500"
				href="https://github.com/AI-Northstar-Tech/mteb-info/tree/main"
				>https://github.com/AI-Northstar-Tech/mteb-info/tree/main</a
			>.
		</p>
	</div>
</div>
