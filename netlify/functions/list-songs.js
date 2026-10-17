import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const store        = getStore('songs');
    const detailsStore = getStore('song-details');
    const { blobs } = await store.list();

    const songKeys = blobs.filter(({ key }) => !key.startsWith('__'));

    // list() doesn't return user metadata — fetch it per-blob in parallel
    const songs = await Promise.all(
      songKeys.map(async ({ key }) => {
        const [result, details] = await Promise.all([
          store.getMetadata(key),
          detailsStore.get(key, { type: 'json' }),
        ]);
        const m = result?.metadata ?? {};
        // A title edited after upload lives in song-details and wins over the original
        return {
          id:         key,
          title:      details?.title || m.title || 'Untitled',
          notes:      details?.notes ?? '',
          uploadedAt: m.uploadedAt ?? null,
          duration:   m.duration   != null ? Number(m.duration)  : null,
          mimeType:   m.mimeType   ?? 'audio/mpeg',
          size:       m.size       ? Number(m.size) : 0,
          category:   m.category   ?? 'pieces',
        };
      })
    );

    const orderRaw = await store.get('__order__');
    const order    = orderRaw ? JSON.parse(orderRaw) : null;

    if (order?.length) {
      const pos = new Map(order.map((id, i) => [id, i]));
      songs.sort((a, b) => {
        const ai = pos.has(a.id) ? pos.get(a.id) : order.length;
        const bi = pos.has(b.id) ? pos.get(b.id) : order.length;
        return ai !== bi ? ai - bi : new Date(a.uploadedAt) - new Date(b.uploadedAt);
      });
    } else {
      songs.sort((a, b) => {
        if (!a.uploadedAt) return 1;
        if (!b.uploadedAt) return -1;
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      });
    }

    return Response.json(songs);
  } catch (err) {
    console.error('list-songs:', err);
    return Response.json([]);
  }
};

export const config = { path: '/api/songs' };
