<script>
	export let data;
</script>

<div class="relative overflow-x-auto border border-0.5 rounded-lg">
	<table class="table-auto w-full border-collapse font-mono text-sm">
		<thead class="font-bold">
			<tr class="">
				{#each data.headers as header}
					<td class="w-fit px-5 py-2 border border-0.5">{header}</td>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.data as data}
				<tr class="even:bg-white odd:bg-gray-50">
					{#each data as value}
						<td class="w-fit px-5 py-1 border border-0.5">
							{@html value}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
