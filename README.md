# Wrong Folk

Band website for Wrong Folk. One-page site with song list and audio playback. Songs are stored in Netlify Blobs and streamed through Netlify Functions.

## Running locally

Requires [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed globally:

```bash
npm install -g netlify-cli
```

Install dependencies and run the dev server:

```bash
cd sites/wrong-folk
npm install
netlify dev
```

Opens at `http://localhost:8888`. The Netlify CLI proxies both the Vite dev server (port 5173) and the Functions at `/.netlify/functions/*`, rewriting them to `/api/*`.

## Environment variables

Set these in a `.env` file (or in the Netlify dashboard under Site settings → Environment variables):

| Variable         | Description                                   |
|------------------|-----------------------------------------------|
| `ADMIN_PASSWORD` | Password for the admin login in the footer    |

For local dev, create `sites/wrong-folk/.env`:

```
ADMIN_PASSWORD=your-password-here
```

## Hero image

Drop a photo at `public/hero.jpg`. It will be used as the full-bleed background for the hero section. The gradient overlay is designed to work with dark nature photography.

## Packages

| Package | Purpose |
|---|---|
| `react` / `react-dom` | UI framework |
| `@netlify/blobs` | Stores audio files as blobs, served via Netlify Function with range request support |
| `uuid` | Generates unique IDs for each uploaded song |
| `vite` + `@vitejs/plugin-react` | Build tool — fast HMR, native ESM |
| `sass` | SCSS support for CSS Modules |

## Deploying

Connect the repo to Netlify, set `build command` to `npm run build`, `publish directory` to `build`, and add the `ADMIN_PASSWORD` environment variable in the Netlify dashboard.
