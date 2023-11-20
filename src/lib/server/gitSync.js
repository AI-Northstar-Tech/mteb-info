import { writeFile } from 'fs/promises';
import cheerio from 'cheerio';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

const gitSync = async (data) => {
	async function gitFileRes(path) {
		return await octokit.rest.repos.getContent({
			owner: process.env.GITHUB_OWNER,
			repo: process.env.GITHUB_REPO,
			branch: process.env.BRANCH,
			path
		});
	}

	const [dataFileRes, logFileRes] = await Promise.all([
		gitFileRes('data/data.json'),
		gitFileRes('data/changelog.json')
	]);

	const dataFileSha = dataFileRes.data.sha;
	const logFileSha = logFileRes.data.sha;
	const prevDataStr = Buffer.from(dataFileRes.data.content, 'base64').toString('utf8');
	const prevLogStr = Buffer.from(logFileRes.data.content, 'base64').toString('utf8');
	const prevData = prevDataStr ? JSON.parse(prevDataStr) : {};
	const prevLog = prevLogStr ? JSON.parse(prevLogStr) : [];
	const isDataChanged = JSON.stringify(JSON.parse(prevDataStr)) !== JSON.stringify(data);
	const changes = [];
	let fullChanges;

	if (isDataChanged) {
		// pushing data changes
		const updatedDataFileRes = await octokit.rest.repos.createOrUpdateFileContents({
			owner: process.env.GITHUB_OWNER,
			repo: process.env.GITHUB_REPO,
			path: 'data/data.json',
			branch: process.env.BRANCH,
			sha: dataFileSha,
			message: 'Update Ranking Data @ ' + new Date(Date.now()).toUTCString(),
			content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
			committer: {
				name: 'data-update-bot',
				email: 'noreply@mteb.info'
			}
		});

		const currModels = getModelsPerSlug(data);
		const prevModels = getModelsPerSlug(prevData);

		for (const slug in currModels) {
			const addedModels =
				currModels[slug].filter((element) => !prevModels[slug]?.includes(element)) || [];
			const removedModels =
				prevModels[slug]?.filter((element) => !currModels[slug].includes(element)) || [];

			addedModels.forEach((model) => {
				changes.push({
					slug,
					model: {
						name: cheerio.load(model).text(),
						url: cheerio.load(model)('a').attr('href')
					},
					time: new Date(Date.now()).toISOString(),
					type: '+'
				});
			});

			removedModels.forEach((model) => {
				changes.push({
					slug,
					model: {
						name: cheerio.load(model).text(),
						url: cheerio.load(model)('a').attr('href')
					},
					time: new Date(Date.now()).toISOString(),
					type: '-'
				});
			});
		}

		fullChanges = [...changes, ...prevLog];

		// pushing changelog
		const updatedLogFileRes = await octokit.rest.repos.createOrUpdateFileContents({
			owner: process.env.GITHUB_OWNER,
			repo: process.env.GITHUB_REPO,
			path: 'data/changelog.json',
			branch: process.env.BRANCH,
			sha: logFileSha,
			message: 'Update changelog file @ ' + new Date(Date.now()).toUTCString(),
			content: Buffer.from(JSON.stringify(fullChanges, null, 2)).toString('base64'),
			committer: {
				name: 'data-update-bot',
				email: 'noreply@mteb.info'
			}
		});
	}
	return { changelog: fullChanges };
};

function getModelsPerSlug(data) {
	const models = {};
	data.table?.forEach((item) => {
		if (item.data) {
			const slug = item.name;
			models[slug] = [];
			item.data.forEach((row) => {
				models[slug].push(row[1]);
			});
		} else {
			item.table?.forEach((itemIn) => {
				const slug = item.name + '/' + itemIn.name;
				models[slug] = [];
				itemIn.data.forEach((row) => {
					models[slug].push(row[1]);
				});
			});
		}
	});
	return models;
}

export default gitSync;
