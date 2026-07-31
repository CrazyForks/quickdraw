# apps

Deployable surfaces, not published packages:

- `website/` — [tryquickdraw.com](https://tryquickdraw.com): Astro static site, docs, and blog. The hero embeds the real SDK.
- `app/` — [the hosted whiteboard](https://tryquickdraw-app.vercel.app): a thin Vite wrapper around `@tryquickdraw/core` with localStorage persistence.

Both consume the engine from the workspace, so they always track `main`.
