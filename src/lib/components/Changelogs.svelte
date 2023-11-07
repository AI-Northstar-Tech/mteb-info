<script>
	export let data = [];
	export let showSlug = false;
</script>

<div>
	<h3 class="mt-6 text-lg">Changelogs :</h3>
	<ul>
		{#each data as item}
			<li class={`${item.type === '+' ? 'li-plus' : 'li-minus'}`}>
				<a href={item.model.url} class="underline">{item.model.name}</a>
				model {item.type === '+' ? 'added' : 'removed'}
				{#if showSlug}
					on <a href={`/${item.slug}`} class="underline">{item.slug}</a>
				{/if}
				at {new Date(item.time).toLocaleString()}
			</li>
		{/each}
	</ul>
</div>
