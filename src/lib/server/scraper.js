import cheerio from 'cheerio';

const getData = async (slug) => {
	const slug1 = slug.split('/')[0]?.toLowerCase();
	const slug2 = slug.split('/')[1]?.toLowerCase();
	const res = await fetch('https://mteb-leaderboard.hf.space');
	const html = await res.text();
	const $ = cheerio.load(html);
	const getScriptText = () => {
		let scriptText;
		$('script')
			.get()
			.map((script) => {
				const scriptTextInside = $(script).text();
				if (scriptTextInside.includes('window.gradio_config')) {
					scriptText = scriptTextInside.replace(`window.gradio_config =`, '').slice(0, -1);
				}
			});
		return scriptText;
	};
	const scriptText = getScriptText();
	const json = JSON.parse(scriptText);
	const components = json.components;
	const primaryTabs = [];
	const secondaryTabs = [];
	let insidePrimary = false;
	let currentPrimaryName;
	let activePrimaryTabIndex;
	let activeSeconderyTabIndex;
	let activePrimaryTabName;
	let activeSeconderyTabName;

	for (let i = 0; i < components.length; i++) {
		console.log(components[i]);
		if (components[i].type === 'tabitem') {
			if (!insidePrimary) {
				currentPrimaryName = components[i].props.label;
				if (components[i].props.label.toLowerCase() === slug1) {
					activePrimaryTabIndex = i;
					primaryTabs.push({ name: components[i].props.label, active: true });
					activePrimaryTabName = components[i].props.label;
				} else {
					primaryTabs.push({ name: components[i].props.label, active: false });
				}
			} else if (currentPrimaryName.toLowerCase() === slug1) {
				if (components[i].props.label.toLowerCase() === slug2) {
					activeSeconderyTabIndex = i;
					secondaryTabs.push({ name: components[i].props.label, active: true });
					activeSeconderyTabName = components[i].props.label;
				} else {
					secondaryTabs.push({
						name: components[i].props.label,
						active: false
					});
				}
			}
		}
		if (components[i].type === 'tabitem' && components[i + 1]?.type === 'tabitem') {
			insidePrimary = true;
		} else if (components[i].type === 'tabs') {
			insidePrimary = false;
		}
	}
	if (!slug2 && secondaryTabs[0]) {
		secondaryTabs[0].active = true;
	}
	if (!slug1 && primaryTabs[0]) {
		primaryTabs[0].active = true;
		activePrimaryTabIndex = 0;
	}

	const getActiveTableData = () => {
		const tableData = {};
		let recursionCount = 0;
		const recursionFn = () => {
			const activeTabIndex = activeSeconderyTabIndex || activePrimaryTabIndex;
			const indexOfComponent = activeTabIndex + recursionCount + 1;
			if (components[indexOfComponent].type === 'markdown') {
				tableData.html = components[indexOfComponent].props.value;
			}
			if (components[indexOfComponent].type === 'dataframe') {
				tableData.data = components[indexOfComponent].props.value.data;
				tableData.headers = components[indexOfComponent].props.value.headers;
			} else {
				recursionCount++;
				recursionFn();
			}
		};
		recursionFn();
		return tableData;
	};

	const data = {
		headerHtml: components[0].props.value,
		footerHtml: components[components.length - 1].props.value,
		primaryTabs,
		secondaryTabs,
		activePrimaryTabName: activePrimaryTabName || primaryTabs[0]?.name,
		activeSeconderyTabName: activeSeconderyTabName || secondaryTabs[0]?.name,
		tableData: getActiveTableData()
	};
	//console.log(data);
	return data;
};
getData('Bitext Mining/Danish');
export default getData;
