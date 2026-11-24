/**
 * Simula el pool de Explorar por género: catálogo + Google subject + TMDB discover.
 * Marca entradas sin portada o con URL sospechosa.
 */
import fs from 'fs';
import { pathToFileURL } from 'url';

// Cargar env estilo Vite
for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const TMDB = process.env.VITE_TMDB_TOKEN;
const GB = process.env.VITE_GOOGLE_BOOKS_KEY;

const genres = [
  { id: 'horror', tmdb: ['27'], subjects: ['horror', 'terror'] },
  { id: 'romance', tmdb: ['10749'], subjects: ['romance', 'love stories'] },
  { id: 'fantasy', tmdb: ['14'], subjects: ['fantasy', 'fantasy fiction'] },
  { id: 'science_fiction', tmdb: ['878'], subjects: ['science fiction', 'dystopia'] },
  { id: 'fiction', tmdb: ['18'], subjects: ['fiction', 'literary fiction'] },
  { id: 'mystery', tmdb: ['9648'], subjects: ['mystery', 'detective'] },
  { id: 'thriller', tmdb: ['53'], subjects: ['thriller', 'suspense'] },
  { id: 'drama', tmdb: ['18'], subjects: ['drama'] },
  { id: 'adventure', tmdb: ['12'], subjects: ['adventure'] },
  { id: 'young_adult', tmdb: ['10751'], subjects: ['young adult', 'teen fiction'] },
];

async function checkImg(url) {
  if (!url) return { ok: false, reason: 'missing' };
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await r.arrayBuffer());
    if (!r.ok) return { ok: false, reason: `http ${r.status}`, size: buf.length };
    if (buf.length < 800) return { ok: false, reason: 'tiny', size: buf.length };
    return { ok: true, size: buf.length };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

async function gbSubject(subject) {
  if (!GB) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`subject:${subject}`)}&maxResults=8&printType=books&key=${GB}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const data = await r.json();
  return (data.items || []).map((item) => {
    const info = item.volumeInfo || {};
    const cover =
      info.imageLinks?.large ||
      info.imageLinks?.medium ||
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail;
    return {
      source: 'gb',
      title: info.title,
      coverUrl: cover?.replace(/^http:/, 'https:'),
    };
  });
}

async function tmdbDiscover(id) {
  if (!TMDB) return [];
  const url = `https://api.themoviedb.org/3/discover/movie?with_genres=${id}&language=es-MX&sort_by=popularity.desc&vote_count.gte=100&page=1`;
  const r = await fetch(url, {
    headers: { accept: 'application/json', Authorization: `Bearer ${TMDB}` },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return (data.results || []).slice(0, 12).map((m) => ({
    source: 'tmdb',
    title: m.title,
    coverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
  }));
}

const bad = [];
for (const g of genres) {
  const books = (await Promise.all(g.subjects.map(gbSubject))).flat();
  const movies = (await Promise.all(g.tmdb.map(tmdbDiscover))).flat();
  const all = [...books, ...movies];
  let genreBad = 0;
  for (const item of all) {
    const c = await checkImg(item.coverUrl);
    if (!c.ok) {
      genreBad++;
      bad.push({ genre: g.id, ...item, ...c });
    }
  }
  console.log(
    `${g.id}: checked ${all.length} (books ${books.length}, movies ${movies.length}) bad ${genreBad}`,
  );
}

console.log('\nBAD ENTRIES');
for (const b of bad) {
  console.log(
    `- [${b.genre}] ${b.source} "${b.title}" → ${b.reason}${b.size != null ? ` size=${b.size}` : ''}`,
  );
}
