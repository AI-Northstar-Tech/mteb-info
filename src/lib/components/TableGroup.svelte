<script>
	import Table from '$lib/components/Table.svelte';
	import Changelog from '$lib/components/Changelog.svelte';
	export let data;
</script>

<div class="flex flex-wrap mt-4">
    {#each data.primaryTabs as primaryTab}
        <a href={primaryTab.url} data-sveltekit-noscroll>
            <div
                class={`px-3 py-2 text-gray-400 translate-y-[0.115rem] ${
                    primaryTab.active
                        ? 'border dark:border-gray-700 border-2 border-b-0 rounded-t-lg !text-gray-900 dark:!text-gray-300 bg-white dark:bg-gray-900'
                        : ''
                }`}
            >
                {primaryTab.name}
            </div>
        </a>
    {/each}
</div>
<div class="border dark:border-gray-700 border-2 rounded-b-lg">
    <div class="p-2">
        {#if data.secondaryTabs.length > 0}
            <div class="flex flex-wrap mt-4">
                {#each data.secondaryTabs as secondaryTab}
                    <a
                        href={secondaryTab.url}
                        data-sveltekit-noscroll
                    >
                        <div
                            class={`px-3 py-2 text-gray-400 bg-white dark:bg-gray-900 ${
                                secondaryTab.active
                                    ? 'border dark:border-gray-700 border-2 border-b-0 rounded-t-lg translate-y-[0.115rem] !text-gray-900 dark:!text-gray-300'
                                    : ''
                            }`}
                        >
                            {secondaryTab.name}
                        </div>
                    </a>
                {/each}
            </div>
            <div class="p-2 border dark:border-gray-700 border-2 rounded-b-lg">
                {#if data.tableData}
                {@html data.tableData.html}
                <Table data={data.tableData} />  
                {/if}
                <Changelog data={data.changelog} />
            </div>
        {:else}
            <div>
                {#if data.tableData}
                {@html data.tableData.html}
                <Table data={data.tableData} />  
                {/if}
                <Changelog data={data.changelog} />
            </div>
            <div class="" />
        {/if}
    </div>
</div>