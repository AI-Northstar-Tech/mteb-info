<script>
	import Changelog from '$lib/components/Changelog.svelte';
	export let data;
</script>


<Changelog data={data.changelog} showSlug={true} />