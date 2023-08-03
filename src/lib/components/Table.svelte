<script>
	import { writable } from 'svelte/store';
	export let data;

	let items = data.data;

	let sortKeyIndex = writable();
	let sortDirection = writable(1);
	let sortedItems = writable(items.slice());

	// Define a function to sort the items
	const sortTable = (key) => {
		// If the same key is clicked, reverse the sort direction
		if ($sortKeyIndex === key) {
			sortDirection.update((val) => -val);
		} else {
			sortKeyIndex.set(key);
			sortDirection.set(1);
		}
	};

	$: {
		const keyIndex = $sortKeyIndex;
		const direction = $sortDirection;
		const sorted = [...$sortedItems].sort((a, b) => {
			const aVal = a[keyIndex];
			const bVal = b[keyIndex];

			if (aVal < bVal) {
				return -direction;
			} else if (aVal > bVal) {
				return direction;
			}
			return 0;
		});
		sortedItems.set(sorted);
	}
</script>

<div class="relative overflow-x-auto border dark:border-gray-700 border-0.5 rounded-lg">
	<table class="table-auto w-full border-collapse font-mono text-sm">
		<thead class="font-bold">
			<tr class="">
				{#each data.headers as header, index}
					<td
						on:click={() => sortTable(index)}
						class="w-fit px-3 py-3 border dark:border-gray-700 border-0.5"
					>
						<div class="flex justify-between items-center gap-4">
							<div>
								{header}
							</div>
							<div
								class={`w-0 h-0
              border-l-[.24rem]
              border-l-transparent
              border-r-[.24rem]
              border-b-[.40rem]
              border-b-gray-200
              border-r-transparent
              ${$sortKeyIndex === index ? '!border-b-orange-500' : ''} ${
									$sortDirection === -1 ? 'rotate-180' : ''
								}`}
							/>
						</div>
					</td>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $sortedItems as data}
				<tr class="odd:bg-gray-50 dark:odd:bg-slate-800">
					{#each data as value}
						<td class="w-fit px-5 py-1 border dark:border-gray-700 border-0.5">
							{@html value}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
