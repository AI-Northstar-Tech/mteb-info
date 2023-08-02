import scraper from '$lib/server/scraper.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const data = await scraper(params.slugs);
		return data;
	} catch (e) {
		throw new error(404, 'Not found');
	}
}
export const config = {
	isr: {
		// Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
		// Setting the value to `false` means it will never expire.
		expiration: 30
	}
};
