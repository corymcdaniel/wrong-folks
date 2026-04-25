export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return new Response('Unauthorized', { status: 401 });
    }

    // The password itself is the token — simple for a personal site
    return Response.json({ token: adminPassword });
  } catch {
    return new Response('Bad request', { status: 400 });
  }
};

export const config = { path: '/api/login' };
