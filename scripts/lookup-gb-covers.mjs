import fs from 'fs';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const KEY = process.env.VITE_GOOGLE_BOOKS_KEY;
const cat = fs.readFileSync('src/data/catalogBooks.ts', 'utf8');
const books = [...cat.matchAll(/title:\s*'([^']+)',\s*\n\s*creator:\s*'([^']+)',/g)].map(
  (m) => ({ title: m[1], creator: m[2] }),
);

async function lookup(title, creator) {
  const q = `intitle:${title} inauthor:${creator.split(' ').slice(-1)[0]}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=3&printType=books&key=${KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  for (const item of data.items || []) {
    const info = item.volumeInfo || {};
    const cover =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail ||
      info.imageLinks?.medium;
    if (!cover) continue;
    return { id: item.id, cover: cover.replace(/^http:/, 'https:') };
  }
  return null;
}

const out = [];
for (const b of books) {
  const hit = await lookup(b.title, b.creator);
  out.push({
    title: b.title,
    gbId: hit?.id || null,
    hasCover: Boolean(hit?.cover),
  });
  await new Promise((r) => setTimeout(r, 120));
}

console.log(JSON.stringify(out, null, 2));
const missing = out.filter((x) => !x.gbId);
console.log('missing', missing.length, '/', out.length);
