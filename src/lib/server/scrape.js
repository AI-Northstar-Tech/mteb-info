import cheerio from 'cheerio';

const getData = async () => {
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
	const table = [];

	let insidePrimary = false;
	let insideSecondery = false;

	for (let i = 0; i < components.length; i++) {
		// determining if we are inside primary or secondery table
		if (components[i].type === 'tabs' && components[i - 1]?.type === 'tabitem') {
			insidePrimary = true;
			insideSecondery = false;
		} else if (components[i].type === 'tabitem' && components[i + 1]?.type === 'tabs') {
			insidePrimary = false;
			insideSecondery = true;
		}

		// scrapping primary and secondary tables
		if (components[i].type === 'tabitem') {
			if (!insidePrimary) {
				table.push({
					name: components[i].props.label,
					table: []
				});
			} else {
				table[table.length - 1].table.push({
					name: components[i].props.label
				});
			}
		}


		const activePrimaryTable = table[table.length - 1];
		const activeTable =
			activePrimaryTable?.table?.length > 0
				? activePrimaryTable.table[activePrimaryTable.table.length - 1]
				: activePrimaryTable;

		// adding table titles and row data
		if (components[i].type === 'dataframe' && (insidePrimary || insideSecondery)) {
			activeTable.headers = components[i].props.value.headers;
			activeTable.data = components[i].props.value.data;
		}

		// adding table markdown
		if (components[i].type === 'markdown' && (insidePrimary || insideSecondery)) {
			activeTable.html = components[i].props.value;
		}
	}
	return {
		headerHtml: components[2].props.value,
		footerHtml: components[components.length - 1].props.value,
		table
	};
};

export default getData;
