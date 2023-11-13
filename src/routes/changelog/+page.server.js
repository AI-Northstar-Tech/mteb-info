import { redirect } from '@sveltejs/kit';

import dotenv from 'dotenv';

dotenv.config();

export async function load() {
	const changelogRes = await fetch(
		`https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/${process.env.BRANCH}/data/changelog.json`
	);
	const changelog = await changelogRes.json();

	throw redirect(302, `/changelog/${encodeURI(changelog[0].slug.split('/')[0])}`);
}
export const config = {
	isr: {
		// Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
		// Setting the value to `false` means it will never expire.
		expiration: 10
	}
};
