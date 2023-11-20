# mteb-info

Static copy of the MTEB Leaderboard on huggingface

It can be found at https://mteb.info

This is meant to be a way to quickly look up the MTEB benchmark for text embeddings model (since the source of truth page - https://huggingface.co/spaces/mteb/leaderboard - is a huggingface space that loads slowly).

To make corrections and improvements to the page, please send a PR to this repository.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
