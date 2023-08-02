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
