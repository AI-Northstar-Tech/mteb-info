import gitSync from "$lib/server/gitSync.js";
import scrape from "$lib/server/scrape.js"

// /api/update GET

export async function GET(event) {
    try {
        const data = await scrape();
        const { changelog } = await gitSync(data);
        
          const options = {
            status: 200
          }
          return new Response('Success', options)  
    } catch (error) {
        const options = {
            status: 500
          }
          return new Response('Fail', options)
    }
}