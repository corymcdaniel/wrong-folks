import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MAX_CHUNK      = 4 * 1024 * 1024;
const MAX_CHUNKS     = 3;
const UUID_RE        = /^[0-9a-f-]{36}$/i;

// Netlify Functions reject request bodies over ~6 MB, so the client sends
// files in 4 MB pieces. upload-song.js joins them into one blob afterwards.
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url   = new URL(req.url);
  const id    = url.searchParams.get('id') ?? '';
  const index = Number(url.searchParams.get('index'));

  if (!UUID_RE.test(id) || !Number.isInteger(index) || index < 0 || index >= MAX_CHUNKS) {
    return Response.json({ error: 'Invalid chunk' }, { status: 400 });
  }

  try {
    const data = await req.arrayBuffer();
    if (data.byteLength === 0 || data.byteLength > MAX_CHUNK) {
      return Response.json({ error: 'Invalid chunk size' }, { status: 400 });
    }

    const store = getStore('song-chunks');
    await store.set(`${id}/${index}`, data);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('upload-chunk:', err);
    return Response.json({ error: 'Chunk upload failed' }, { status: 500 });
  }
};

export const config = { path: '/api/upload/chunk' };
