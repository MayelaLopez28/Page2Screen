/**
 * Reescribe coverUrl del catálogo: Google Books primero (más estable en el navegador),
 * Open Library como coverFallback.
 */
import fs from 'fs';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const KEY = process.env.VITE_GOOGLE_BOOKS_KEY;
const path = 'src/data/catalogBooks.ts';
let src = fs.readFileSync(path, 'utf8');

// Asegurar helpers
if (!src.includes('function coverGb')) {
  throw new Error('coverGb helper missing');
}

const entryRe =
  /\{\s*\n\s*id:\s*'([^']+)',[\s\S]*?title:\s*'((?:\\'|[^'])+)',\s*\n\s*creator:\s*'((?:\\'|[^'])+)',[\s\S]*?coverUrl:\s*([^,\n]+),/g;

const matches = [...src.matchAll(entryRe)];
console.log('entries', matches.length);

async function lookup(title, creator) {
  const author = creator.split(/\s+/).slice(-1)[0];
  const q = `intitle:${title} inauthor:${author}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books&key=${KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  for (const item of data.items || []) {
    const info = item.volumeInfo || {};
    if (!info.imageLinks) continue;
    // Prefer exact-ish title match
    const t = (info.title || '').toLowerCase();
    if (!t.includes(title.toLowerCase().slice(0, 8)) && !title.toLowerCase().includes(t.slice(0, 8))) {
      continue;
    }
    return item.id;
  }
  // fallback first with image
  for (const item of data.items || []) {
    if (item.volumeInfo?.imageLinks) return item.id;
  }
  return null;
}

const map = new Map();
for (const m of matches) {
  const [, id, title, creator, coverExpr] = m;
  const gbId = await lookup(title.replace(/\\'/g, "'"), creator.replace(/\\'/g, "'"));
  map.set(id, { title, creator, coverExpr: coverExpr.trim(), gbId });
  console.log(title, '→', gbId || 'KEEP');
  await new Promise((r) => setTimeout(r, 100));
}

// Patch each entry's coverUrl line by id proximity
for (const [id, info] of map) {
  if (!info.gbId) continue;
  // Find block starting at this id and replace first coverUrl
  const idIdx = src.indexOf(`id: '${id}'`);
  if (idIdx < 0) continue;
  const slice = src.slice(idIdx, idIdx + 900);
  const coverMatch = slice.match(/coverUrl:\s*([^,\n]+),/);
  if (!coverMatch) continue;
  const oldExpr = coverMatch[1].trim();
  let fallbackLine = '';
  if (oldExpr.startsWith('coverOl(') || oldExpr.startsWith('coverGb(')) {
    fallbackLine = `\n    coverFallbacks: [${oldExpr}],`;
  } else if (oldExpr.includes('openlibrary.org/b/id/')) {
    const ol = oldExpr.match(/\/b\/id\/(\d+)/);
    if (ol) fallbackLine = `\n    coverFallbacks: [coverOl(${ol[1]})],`;
  }
  // Avoid duplicating coverFallbacks if already present nearby
  const blockEnd = src.indexOf('},', idIdx);
  const block = src.slice(idIdx, blockEnd);
  if (block.includes('coverFallbacks:')) {
    src =
      src.slice(0, idIdx) +
      block.replace(/coverUrl:\s*[^,\n]+,/, `coverUrl: coverGb('${info.gbId}'),`) +
      src.slice(blockEnd);
  } else {
    src =
      src.slice(0, idIdx) +
      block.replace(
        /coverUrl:\s*[^,\n]+,/,
        `coverUrl: coverGb('${info.gbId}'),${fallbackLine}`,
      ) +
      src.slice(blockEnd);
  }
}

// Update CatalogBook type for coverFallbacks
if (!src.includes('coverFallbacks?:')) {
  src = src.replace(
    /aliases\?: string\[\];/,
    `aliases?: string[];\n  coverFallbacks?: string[];`,
  );
}

fs.writeFileSync(path, src);
console.log('patched', path);
