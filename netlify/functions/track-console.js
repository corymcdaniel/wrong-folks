import { getStore } from '@netlify/blobs';

// Only the commands on window.folks are accepted
const COMMANDS = ['help', 'cat', 'fortune', 'stats', 'vibe', 'secret'];

// Coarse device info only, never the full user agent or IP
function describeDevice(ua) {
  let device = 'desktop';
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) device = 'mobile';

  let browser = 'other';
  if (/Edg\//.test(ua)) browser = 'edge';
  else if (/Firefox\//.test(ua)) browser = 'firefox';
  else if (/Chrome\//.test(ua)) browser = 'chrome';
  else if (/Safari\//.test(ua)) browser = 'safari';

  return { device, browser };
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const command   = String(body.command ?? '');
  const sessionId = String(body.sessionId ?? '').slice(0, 64);

  if (!COMMANDS.includes(command) || !sessionId) {
    return new Response('Bad request', { status: 400 });
  }

  const store = getStore('console');
  const at = new Date().toISOString();
  const { device, browser } = describeDevice(req.headers.get('user-agent') ?? '');

  // Key is <epoch ms>-<command>-<random>: sorts by time, and counts can be
  // read from a key listing. No shared rollup, so simultaneous requests
  // can't overwrite each other's counts.
  const eventKey = `events/${Date.now()}-${command}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await Promise.all([
      store.set(eventKey, JSON.stringify({ command, sessionId, device, browser, at })),
      store.set(`sessions/${sessionId}`, at),
    ]);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('track-console:', err);
    return new Response('Server error', { status: 500 });
  }
};

export const config = { path: '/api/track-console' };
