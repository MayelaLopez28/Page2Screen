import fs from 'fs';

const cat = fs.readFileSync('src/data/catalogBooks.ts', 'utf8');
const mock = fs.readFileSync('src/data/mock.ts', 'utf8');

function extractOlIds(src) {
  return [...src.matchAll(/coverOl\((\d+)\)|covers\.openlibrary\.org\/b\/id\/(\d+)/g)].map(
    (m) => m[1] || m[2],
  );
}
function extractIsbn(src) {
  return [...src.matchAll(/covers\.openlibrary\.org\/b\/isbn\/([^"'\\\s]+)/g)].map((m) => m[1]);
}
function extractGb(src) {
  return [...src.matchAll(/coverGb\('([^']+)'\)/g)].map((m) => m[1]);
}
function extractTmdb(src) {
  return [...src.matchAll(/tmdb\('(\/[^']+)'\)/g)].map((m) => m[1]);
}

const ol = [...new Set([...extractOlIds(cat), ...extractOlIds(mock)])];
const isbn = [...new Set(extractIsbn(mock + cat))];
const gb = [...new Set(extractGb(cat))];
const tmdb = [...new Set(extractTmdb(mock))];

async function check(url) {
  try {
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, size: buf.length, ok: r.ok && buf.length > 800 };
  } catch (e) {
    return { status: 0, size: 0, ok: false, err: String(e) };
  }
}

const results = [];
for (const id of ol) {
  const url = `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
  results.push({ kind: 'ol', id, url, ...(await check(url)) });
}
for (const id of isbn) {
  const url = `https://covers.openlibrary.org/b/isbn/${id}`;
  results.push({ kind: 'isbn', id, url, ...(await check(url)) });
}
for (const id of gb) {
  const q = new URLSearchParams({
    id,
    printsec: 'frontcover',
    img: '1',
    zoom: '2',
    source: 'gbs_api',
  });
  const url = `https://books.google.com/books/content?${q}`;
  results.push({ kind: 'gb', id, url, ...(await check(url)) });
}
for (const path of tmdb) {
  const url = `https://image.tmdb.org/t/p/w500${path}`;
  results.push({ kind: 'tmdb', id: path, url, ...(await check(url)) });
}

const bad = results.filter((r) => !r.ok);
console.log(`checked ${results.length} bad ${bad.length}`);
for (const b of bad) {
  console.log(`${b.kind} ${b.id} status=${b.status} size=${b.size}`);
}
