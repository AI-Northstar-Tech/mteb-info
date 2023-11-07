<script>
	import Changelogs from '$lib/components/Changelogs.svelte';
	export let data;
</script>


<Changelogs data={data.changelogs} showSlug={true} />