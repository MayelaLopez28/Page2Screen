/**
 * Proxy serverless TMDB (Vercel catch-all).
 * Variable de servidor: TMDB_TOKEN (sin prefijo VITE_).
 * Cliente: VITE_TMDB_PROXY=/api/tmdb
 *
 * Ejemplo: GET /api/tmdb/search/movie?query=matrix&language=es-MX
 */

export default async function handler(req, res) {
  const token = process.env.TMDB_TOKEN;

  if (!token) {
    res.status(500).json({ error: 'TMDB_TOKEN no configurado en el servidor' });
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const parts = req.query.path;
  const cleanPath = Array.isArray(parts) ? parts.join('/') : String(parts || '');

  if (!cleanPath || cleanPath.includes('..')) {
    res.status(400).json({ error: 'Ruta TMDB inválida' });
    return;
  }

  const incoming = new URL(req.url, 'http://localhost');
  const target = `https://api.themoviedb.org/3/${cleanPath}${incoming.search}`;

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(upstream.status).send(body);
  } catch (error) {
    res.status(502).json({
      error: 'No se pudo contactar TMDB',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
