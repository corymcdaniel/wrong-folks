# Wrong Folks

Band website for Wrong Folks. One-page site with song lists and audio playback. Songs are stored in Netlify Blobs and streamed through Netlify Functions.

## Song sections

Songs are split into two lists, each with its own Play All, admin upload, drag-to-reorder and delete:

| Section | Category | Use |
|---|---|---|
| Pieces | `pieces` | Instrumentals / soundscapes |
| Lyrics | `lyrics` | Songs with written lyrics |

Each song stores its `category` in its blob metadata. Songs uploaded before categories existed default to `pieces`. Sections are defined in the `SECTIONS` array in `src/App.jsx`. To add another one, add an entry there and add its category to `CATEGORIES` in `netlify/functions/upload-song.js`.

## Running locally

Requires [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed globally:

```bash
npm install -g netlify-cli
```

Install dependencies and run the dev server:

```bash
cd sites/wrongfolks
npm install
netlify dev
```

Opens at `http://localhost:8888`. The Netlify CLI proxies both the Vite dev server (port 5173) and the Functions at `/.netlify/functions/*`, rewriting them to `/api/*`.

## Environment variables

Set these in a `.env` file (or in the Netlify dashboard under Site settings → Environment variables):

| Variable         | Description                                   |
|------------------|-----------------------------------------------|
| `ADMIN_PASSWORD` | Password for the admin login in the footer    |

For local dev, create `sites/wrongfolks/.env`:

```
ADMIN_PASSWORD=your-password-here
```

## Hero image

The hero background is set in `src/components/Hero/Hero.module.scss` and currently uses `src/images/20231224_132745.jpg`. The gradient overlay is designed to work with dark photography.

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
