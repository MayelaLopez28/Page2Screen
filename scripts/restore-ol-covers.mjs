import fs from 'fs';

const path = 'src/data/catalogBooks.ts';
let src = fs.readFileSync(path, 'utf8');

// Open Library primero (las que ya se veían bien); Google solo de respaldo.
src = src.replace(
  /coverUrl:\s*coverGb\('([^']+)'\),\s*\n\s*coverFallbacks:\s*\[coverOl\((\d+)\)\],/g,
  (_m, gb, ol) =>
    `coverUrl: coverOl(${ol}),\n    coverFallbacks: [coverGb('${gb}')],`,
);

fs.writeFileSync(path, src);

const stillGbPrimary = [...src.matchAll(/coverUrl:\s*coverGb/g)].length;
const olPrimary = [...src.matchAll(/coverUrl:\s*coverOl/g)].length;
console.log({ olPrimary, stillGbPrimary });
