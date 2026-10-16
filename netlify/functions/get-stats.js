import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const RECENT_CONSOLE_EVENTS = 15;

// Totals, unique sessions, and the latest folks.* commands typed in the console
async function getConsoleStats() {
  const store = getStore('console');

  const [sessions, events] = await Promise.all([
    store.list({ prefix: 'sessions/' }),
    store.list({ prefix: 'events/' }),
  ]);

  // Keys look like events/<epoch ms>-<command>-<random>
  const keys = events.blobs.map((b) => b.key).sort();
  const counts = {};
  keys.forEach((key) => {
    const command = key.slice('events/'.length).split('-')[1];
    counts[command] = (counts[command] ?? 0) + 1;
  });

  let lastAt = null;
  if (keys.length > 0) {
    const lastMs = Number(keys[keys.length - 1].slice('events/'.length).split('-')[0]);
    lastAt = new Date(lastMs).toISOString();
  }

  const recentKeys = keys.slice(-RECENT_CONSOLE_EVENTS).reverse();

  const recent = await Promise.all(recentKeys.map(async (key) => {
    const raw = await store.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  }));

  const commands = Object.entries(counts)
    .map(([command, count]) => ({ command, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: keys.length,
    sessions: sessions.blobs.length,
    lastAt,
    commands,
    recent: recent.filter(Boolean),
  };
}

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

    const consoleStats = await getConsoleStats();

    return Response.json({ songs: filtered, totals, console: consoleStats });
  } catch (err) {
    console.error('get-stats:', err);
    return new Response('Server error', { status: 500 });
  }
};

export const config = { path: '/api/stats' };
