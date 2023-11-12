import { error } from '@sveltejs/kit';
import dotenv from 'dotenv'

dotenv.config()

export async function load({ params }) {
	try {
		const slug1 = params.slugs.split('/')[0];
		const slug2 = params.slugs.split('/')[1];

		const dataResPromise = fetch(`https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.BRANCH}/data/data.json`)
		const changelogResPromise = fetch(`https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.BRANCH}/data/changelog.json`)
		const [dataRes,changelogRes] = await Promise.all([dataResPromise,changelogResPromise])
		const data = await dataRes.json()
		const changelog = await changelogRes.json()
		
		const table = data.table;
		const pageData = {
			headerHtml: data.headerHtml,
			footerHtml: data.footerHtml,
			primaryTabs: [],
			secondaryTabs: [],
			activePrimaryTabName: undefined,
			activeSeconderyTabName: undefined,
			tableData: undefined
		};

		for (let i = 0; i < table.length; i++) {
			const isActivePrimary = slug1 ? table[i].name === slug1 : i === 0;
			const currentPrimary = table[i].name
			pageData.primaryTabs.push({
				name: currentPrimary,
				url: `/${encodeURI(currentPrimary)}`,
				active: isActivePrimary
			});
			if (isActivePrimary) {
				pageData.activePrimaryTabName = table[i].name;
				if (table[i].table.length > 0) {
					table[i].table.forEach((table, i) => {
						const isActiveSecondery = slug2 ? table.name === slug2 : i === 0;
						const currentSecondery = table.name
						if (isActiveSecondery) {
							pageData.activeSeconderyTabName = table.name;
							pageData.tableData = table;
						}
						pageData.secondaryTabs.push({
							name: table.name,
							url: `/${encodeURI(currentPrimary)}/${encodeURI(currentSecondery)}`,
							active: isActiveSecondery
						});
					});
				} else {
					pageData.tableData = table[i];
				}
			}
		}
		const slug = pageData.activeSeconderyTabName
			? `${pageData.activePrimaryTabName}/${pageData.activeSeconderyTabName}`
			: pageData.activePrimaryTabName;

		const filteredChangelog = changelog.filter((item) => item.slug === slug);
	
		return { ...pageData, changelog: filteredChangelog };
	} catch (e) {
		console.log(e);
		throw new error(404, 'Not found');
	}
}
export const config = {
	isr: {
		// Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
		// Setting the value to `false` means it will never expire.
		expiration: 10
	}
};
