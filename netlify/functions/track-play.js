import { getStore } from '@netlify/blobs';

const MIN_LISTENED_SECONDS = 1;

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const playId   = String(body.playId   ?? '').slice(0, 64);
  const songId   = String(body.songId   ?? '').slice(0, 64);
  const sessionId = String(body.sessionId ?? '').slice(0, 64);
  const listened = safeNumber(body.listenedSeconds);
  const songDur  = safeNumber(body.songDuration);
  const completed = Boolean(body.completed);

  if (!playId || !songId || !sessionId) {
    return new Response('Missing fields', { status: 400 });
  }
  if (listened < MIN_LISTENED_SECONDS) {
    return new Response(null, { status: 204 });
  }

  const store = getStore('plays');
  const eventKey  = `events/${songId}/${playId}`;
  const rollupKey = `rollups/${songId}`;

  try {
    const [existingEventRaw, existingRollupRaw] = await Promise.all([
      store.get(eventKey),
      store.get(rollupKey),
    ]);

    const existingEvent = existingEventRaw ? JSON.parse(existingEventRaw) : null;
    const rollup = existingRollupRaw
      ? JSON.parse(existingRollupRaw)
      : { plays: 0, listenedSeconds: 0, completes: 0, lastPlayedAt: null };

    if (existingEvent) {
      const delta = Math.max(0, listened - safeNumber(existingEvent.listenedSeconds));
      rollup.listenedSeconds += delta;
      if (completed && !existingEvent.completed) rollup.completes += 1;
    } else {
      rollup.plays += 1;
      rollup.listenedSeconds += listened;
      if (completed) rollup.completes += 1;
    }
    rollup.lastPlayedAt = new Date().toISOString();

    const event = {
      playId,
      songId,
      sessionId,
      listenedSeconds: Math.max(listened, safeNumber(existingEvent?.listenedSeconds)),
      songDuration: songDur || safeNumber(existingEvent?.songDuration),
      completed: completed || Boolean(existingEvent?.completed),
      startedAt: existingEvent?.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await Promise.all([
      store.set(eventKey, JSON.stringify(event)),
      store.set(rollupKey, JSON.stringify(rollup)),
    ]);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('track-play:', err);
    return new Response('Server error', { status: 500 });
  }
};

export const config = { path: '/api/track-play' };
