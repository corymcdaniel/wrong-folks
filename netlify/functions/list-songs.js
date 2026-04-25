import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const store = getStore('songs');
    const { blobs } = await store.list({ includeMeta: true });

    const songs = blobs.map(({ key, metadata }) => ({
      id:          key,
      title:       metadata?.title       ?? 'Untitled',
      uploadedAt:  metadata?.uploadedAt  ?? null,
      duration:    metadata?.duration    ?? null,
      mimeType:    metadata?.mimeType    ?? 'audio/mpeg',
      size:        metadata?.size        ?? 0,
    }));

    songs.sort((a, b) => {
      if (!a.uploadedAt) return 1;
      if (!b.uploadedAt) return -1;
      return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    });

    return Response.json(songs);
  } catch (err) {
    console.error('list-songs:', err);
    return Response.json([]);
  }
};

export const config = { path: '/api/songs' };
