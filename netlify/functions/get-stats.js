import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async (req) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  const auth = req.headers.get('Authorization') ?? '';
  if (!ADMIN_PASSWORD || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const plays = getStore('plays');
    const { blobs } = await plays.list({ prefix: 'rollups/' });

    const songs = await Promise.all(
      blobs.map(async ({ key }) => {
        const raw = await plays.get(key);
        if (!raw) return null;
        const r = JSON.parse(raw);
        const songId = key.slice('rollups/'.length);
        return {
          songId,
          plays:           r.plays           ?? 0,
          listenedSeconds: r.listenedSeconds ?? 0,
          completes:       r.completes       ?? 0,
          lastPlayedAt:    r.lastPlayedAt    ?? null,
        };
      })
    );

    const filtered = songs.filter(Boolean);

    // Enrich with song titles when available
    const songsStore = getStore('songs');
    await Promise.all(filtered.map(async (s) => {
      try {
        const meta = await songsStore.getMetadata(s.songId);
        s.title = meta?.metadata?.title ?? 'Untitled';
      } catch {
        s.title = 'Unknown';
      }
    }));

    const totals = filtered.reduce(
      (acc, s) => ({
        plays:           acc.plays + s.plays,
        listenedSeconds: acc.listenedSeconds + s.listenedSeconds,
        completes:       acc.completes + s.completes,
      }),
      { plays: 0, listenedSeconds: 0, completes: 0 },
    );

    filtered.sort((a, b) => b.plays - a.plays);

    return Response.json({ songs: filtered, totals });
  } catch (err) {
    console.error('get-stats:', err);
    return new Response('Server error', { status: 500 });
  }
};

export const config = { path: '/api/stats' };
