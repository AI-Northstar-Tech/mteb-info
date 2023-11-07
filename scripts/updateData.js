import gitSync from "../src/lib/server/gitSync.js";
import scrape from "../src/lib/server/scrape.js"

const data = await scrape();
const { changelogs } = await gitSync(data);

console.log(changelogs)