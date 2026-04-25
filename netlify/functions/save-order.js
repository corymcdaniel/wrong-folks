import { getStore } from '@netlify/blobs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async (req) => {
  if (req.method !== 'PUT') return new Response('Method not allowed', { status: 405 });

  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) return new Response('Unauthorized', { status: 401 });

  try {
    const { order } = await req.json();
    if (!Array.isArray(order)) return Response.json({ error: 'Invalid' }, { status: 400 });

    const store = getStore('songs');
    await store.set('__order__', JSON.stringify(order));

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('save-order:', err);
    return new Response('Server error', { status: 500 });
  }
};

export const config = { path: '/api/songs/order' };
