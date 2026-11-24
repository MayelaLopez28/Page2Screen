const urls = [
  'https://covers.openlibrary.org/b/id/14351077-L.jpg',
  'https://covers.openlibrary.org/b/id/14612610-L.jpg',
  'https://covers.openlibrary.org/b/id/11200092-L.jpg',
  'https://covers.openlibrary.org/b/id/8745958-L.jpg',
  'https://image.tmdb.org/t/p/w500/5f69fuZBiPoa8H1AJ3UHH4AztOb.jpg',
  'https://image.tmdb.org/t/p/w500/ls1KWflioSJgCcKhDr6ykvYmgbI.jpg',
  'https://image.tmdb.org/t/p/w500/rdukIaIVFRrjy51jIdd5PTKwhKv.jpg',
  'https://image.tmdb.org/t/p/w500/fBFjaDWfNslvrs6bJjknmG27wOS.jpg',
];

for (const url of urls) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await r.arrayBuffer());
    console.log(r.status, buf.length, url.slice(-40));
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
