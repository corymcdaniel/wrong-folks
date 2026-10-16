# Wrong Folks

Band website for Wrong Folks. One-page site with song lists and audio playback. Songs are stored in Netlify Blobs and streamed through Netlify Functions.

## Song sections

Songs are split into two lists, each with its own Play All, admin upload, drag-to-reorder and delete:

| Section | Category | Use |
|---|---|---|
| Pieces | `pieces` | Instrumentals / soundscapes |
| Lyrics | `lyrics` | Songs with written lyrics |

Each song stores its `category` in its blob metadata. Songs uploaded before categories existed default to `pieces`. Sections are defined in the `SECTIONS` array in `src/App.jsx`. To add another one, add an entry there and add its category to `CATEGORIES` in `netlify/functions/upload-song.js`.

### Section info modals

A section can have a Markdown file that opens in a modal when its heading is clicked. The Lyrics heading uses `src/content/lyrics.md`. Edit that file to change what the modal shows. It uses standard Markdown, so lines in a paragraph flow together. To force a line break, end the line with a backslash (`\`) or two spaces.

To add a modal to another section, import a `.md` file with `?raw` in `src/App.jsx` and set it as the section's `info` field.

### Upload size

Uploads can be up to **10 MB**. Netlify Functions cap request and response bodies at about 6 MB, so:

- The browser sends the file in 4 MB pieces to `/api/upload/chunk`. They're stored temporarily in the `song-chunks` blob store.
- A final call to `/api/upload` joins the pieces into a single blob in the `songs` store and deletes them.
- `/api/song/:id` returns at most 4 MB per range request. Browsers fetch the next range automatically during playback.

To raise the limit, change `MAX_BYTES` in `UploadModal.jsx` and `upload-song.js`, and `MAX_CHUNKS` in both functions.

## Console easter eggs

Open the browser console on the site to see a title card, the cat and dry reactions to what you do on the page. Visitors can type `folks.help()` to see the commands. The messages are in `src/utils/consoleEggs.js` and the ASCII art is in `src/content/*.txt`.

### Console logging

Each `folks.*` command someone types is logged to the `console` Netlify Blobs store by `/api/track-console`:

- `events/<epoch ms>-<command>-<random>`: the command, the anonymous session ID (the same one play tracking uses), a coarse device type (`mobile`/`desktop`) and browser family, and a timestamp. No IP address or full user agent is stored.
- `sessions/<sessionId>`: one key per session, used to count unique sessions.

Counts come from listing the event keys rather than from a shared rollup, so simultaneous requests can't overwrite each other. Admins can see totals, per-command counts and the 15 most recent commands in the Console section of the Stats modal.

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
| `vite` + `@vitejs/plugin-react` | Build tool — fast HMR, native ESM |
| `sass` | SCSS support for CSS Modules |
| `marked` | Turns the section info Markdown into HTML. It has no DOM dependency, so it works with the prerender step (react-markdown doesn't) |

## Deploying

Connect the repo to Netlify, set `build command` to `npm run build`, `publish directory` to `build`, and add the `ADMIN_PASSWORD` environment variable in the Netlify dashboard.
