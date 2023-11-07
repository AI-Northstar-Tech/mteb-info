<script>
	import '../app.postcss';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
</script>


<div class="p-4 pt-8 md:px-[10%]">
	<div class="fixed top-2 right-4 md:right-[10%] z-50">
		<ThemeSwitch />
	</div>
	<slot />
</div>
