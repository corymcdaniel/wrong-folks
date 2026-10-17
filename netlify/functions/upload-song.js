import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CATEGORIES     = ['pieces', 'lyrics'];
const MAX_BYTES      = 10 * 1024 * 1024;
const MAX_CHUNKS     = 3;
const MAX_NOTES      = 10000;
const UUID_RE        = /^[0-9a-f-]{36}$/i;

function authorized(req) {
  const auth = req.headers.get('Authorization') ?? '';
  return auth === `Bearer ${ADMIN_PASSWORD}`;
}

async function deleteChunks(chunkStore, id, count) {
  const keys = Array.from({ length: count }, (_, i) => `${id}/${i}`);
  await Promise.all(keys.map((key) => chunkStore.delete(key)));
}

// Finalizes an upload: joins the pieces sent to /api/upload/chunk into a
// single song blob, then removes the pieces.
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!authorized(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let chunkStore = null;
  let id         = '';
  let chunks     = 0;

  try {
    const body     = await req.json();
    const title    = String(body.title ?? '').trim();
    const notes    = String(body.notes ?? '').trim().slice(0, MAX_NOTES);
    const category = body.category || 'pieces';
    const mimeType = body.mimeType || 'audio/mpeg';
    const duration = body.duration != null ? parseFloat(body.duration) : null;
    id     = String(body.id ?? '');
    chunks = Number(body.chunks);

    if (!UUID_RE.test(id) || !title) {
      return Response.json({ error: 'Missing id or title' }, { status: 400 });
    }

    if (!Number.isInteger(chunks) || chunks < 1 || chunks > MAX_CHUNKS) {
      return Response.json({ error: 'Invalid chunk count' }, { status: 400 });
    }

    if (!CATEGORIES.includes(category)) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    chunkStore = getStore('song-chunks');
    const parts = await Promise.all(
      Array.from({ length: chunks }, (_, i) => chunkStore.get(`${id}/${i}`, { type: 'arrayBuffer' }))
    );

    if (parts.some((p) => !p)) {
      return Response.json({ error: 'Missing chunks' }, { status: 400 });
    }

    const size = parts.reduce((sum, p) => sum + p.byteLength, 0);
    if (size > MAX_BYTES) {
      await deleteChunks(chunkStore, id, chunks);
      return Response.json({ error: 'File too large' }, { status: 413 });
    }

    const combined = new Uint8Array(size);
    let offset = 0;
    for (const p of parts) {
      combined.set(new Uint8Array(p), offset);
      offset += p.byteLength;
    }

    const uploadedAt = new Date().toISOString();
    const store      = getStore('songs');
    await store.set(id, combined.buffer, {
      metadata: {
        title,
        uploadedAt,
        mimeType,
        size:     String(size),
        duration: duration != null ? String(duration) : '',
        category,
      },
    });

    if (notes) {
      await getStore('song-details').setJSON(id, { title, notes });
    }

    await deleteChunks(chunkStore, id, chunks);

    return Response.json({ id, title, notes, uploadedAt, duration, mimeType, category });
  } catch (err) {
    console.error('upload-song:', err);
    if (chunkStore && id && chunks) {
      await deleteChunks(chunkStore, id, chunks).catch(() => {});
    }
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
};

export const config = { path: '/api/upload' };
