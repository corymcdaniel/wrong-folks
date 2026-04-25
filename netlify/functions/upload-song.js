import { getStore } from '@netlify/blobs';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function authorized(req) {
  const auth = req.headers.get('Authorization') ?? '';
  return auth === `Bearer ${ADMIN_PASSWORD}`;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!authorized(req)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const form     = await req.formData();
    const file     = form.get('file');
    const title    = form.get('title');
    const durStr   = form.get('duration');

    if (!file || !title) {
      return Response.json({ error: 'Missing file or title' }, { status: 400 });
    }

    const id          = uuidv4();
    const arrayBuffer = await file.arrayBuffer();
    const uploadedAt  = new Date().toISOString();
    const duration    = durStr ? parseFloat(durStr) : null;

    const store = getStore('songs');
    await store.set(id, arrayBuffer, {
      metadata: {
        title:      title.trim(),
        uploadedAt,
        mimeType:   file.type || 'audio/mpeg',
        size:       file.size,
        duration,
      },
    });

    return Response.json({ id, title: title.trim(), uploadedAt, duration, mimeType: file.type });
  } catch (err) {
    console.error('upload-song:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
};

export const config = { path: '/api/upload' };
