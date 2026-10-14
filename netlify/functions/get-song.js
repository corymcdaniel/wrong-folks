import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Function responses are capped at ~6 MB, so range responses are limited to
// 4 MB. Browsers request the next range on their own when a 206 ends early.
const MAX_RANGE = 4 * 1024 * 1024;

function parseRange(header, total) {
  const m = header.match(/bytes=(\d*)-(\d*)/);
  if (!m) return null;
  const start = m[1] ? parseInt(m[1]) : 0;
  const end   = m[2] ? parseInt(m[2]) : total - 1;
  return {
    start: Math.max(0, start),
    end:   Math.min(total - 1, end, start + MAX_RANGE - 1),
  };
}

// Full (non-range) responses are streamed, which lifts the buffered size cap
function streamBuffer(data) {
  const bytes = new Uint8Array(data);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.byteLength) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.subarray(offset, offset + MAX_RANGE));
      offset += MAX_RANGE;
    },
  });
}

export default async (req, context) => {
  const { id } = context.params;

  // --- GET: stream audio ---
  if (req.method === 'GET') {
    try {
      const store  = getStore('songs');
      const result = await store.getWithMetadata(id, { type: 'arrayBuffer' });

      if (!result?.data) return new Response('Not found', { status: 404 });

      const { data, metadata } = result;
      const total    = data.byteLength;
      const mimeType = metadata?.mimeType ?? 'audio/mpeg';
      const range    = req.headers.get('Range');

      if (range) {
        const r = parseRange(range, total);
        if (!r || r.start > r.end) return new Response('Invalid range', { status: 416 });
        const chunk = data.slice(r.start, r.end + 1);
        return new Response(chunk, {
          status: 206,
          headers: {
            'Content-Type':   mimeType,
            'Content-Range':  `bytes ${r.start}-${r.end}/${total}`,
            'Accept-Ranges':  'bytes',
            'Content-Length': String(chunk.byteLength),
            'Cache-Control':  'public, max-age=31536000',
          },
        });
      }

      return new Response(streamBuffer(data), {
        status: 200,
        headers: {
          'Content-Type':   mimeType,
          'Accept-Ranges':  'bytes',
          'Content-Length': String(total),
          'Cache-Control':  'public, max-age=31536000',
        },
      });
    } catch (err) {
      console.error('get-song GET:', err);
      return new Response('Server error', { status: 500 });
    }
  }

  // --- DELETE: remove song ---
  if (req.method === 'DELETE') {
    const auth = req.headers.get('Authorization') ?? '';
    if (auth !== `Bearer ${ADMIN_PASSWORD}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    try {
      const store = getStore('songs');
      await store.delete(id);
      return new Response(null, { status: 204 });
    } catch (err) {
      console.error('get-song DELETE:', err);
      return new Response('Server error', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/song/:id' };
