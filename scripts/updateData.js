import gitSync from '../src/lib/server/gitSync.js';
import scrape from '../src/lib/server/scrape.js';

const data = await scrape();
const { changelog } = await gitSync(data);

console.log(changelog);
