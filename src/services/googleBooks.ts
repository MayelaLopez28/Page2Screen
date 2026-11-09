import type { SearchResult } from '../types';
import {
  CATALOG_BOOKS,
  getCatalogBookById,
  searchCatalogBooks,
} from '../data/catalogBooks';
import { dedupeById } from '../utils/searchMatch';

const BASE = 'https://www.googleapis.com/books/v1';

function apiKeyParam() {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_KEY as string | undefined;
  return key ? `&key=${encodeURIComponent(key)}` : '';
}

function hasApiKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_BOOKS_KEY);
}

function warnDemo(context: string) {
  console.warn(`[Page2Screen] Google Books (${context}): usando catálogo local con portadas ISBN.`);
}

function upgradeCover(url?: string) {
  if (!url) {
    return undefined;
  }

  return url
    .replace(/^http:/, 'https:')
    .replace(/zoom=\d/, 'zoom=2')
    .replace(/&edge=curl/i, '');
}

function pickGenre(categories?: string[]) {
  if (!categories?.length) {
    return ['fiction'];
  }

  return categories.slice(0, 3).map((c) =>
    c
      .split('/')
      .pop()!
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_'),
  );
}

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
};

function isbnOf(item: GoogleVolume) {
  const ids = item.volumeInfo?.industryIdentifiers || [];
  return (
    ids.find((i) => i.type === 'ISBN_13')?.identifier ||
    ids.find((i) => i.type === 'ISBN_10')?.identifier
  );
}

function mapVolume(item: GoogleVolume): SearchResult | null {
  const info = item.volumeInfo;
  if (!info?.title) {
    return null;
  }

  const isbn = isbnOf(item);

  const cover =
    (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : undefined) ||
    upgradeCover(
      info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail,
    );

  if (!cover) {
    return null;
  }

  return {
    id: isbn ? `b_isbn_${isbn}` : `b_gb_${item.id}`,
    type: 'book',
    title: info.title,
    creator: info.authors?.[0] || 'Autor Desconocido',
    year: info.publishedDate?.slice(0, 4) || 'Desc.',
    coverUrl: cover,
    genres: pickGenre(info.categories),
  };
}

function toSearchResult(b: (typeof CATALOG_BOOKS)[number]): SearchResult {
  return {
    id: b.id,
    type: 'book',
    title: b.title,
    creator: b.creator,
    year: b.year,
    coverUrl: b.coverUrl,
    genres: b.genres,
  };
}

async function fetchVolumes(query: string, maxResults = 8): Promise<SearchResult[]> {
  if (!hasApiKey()) {
    return [];
  }

  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books${apiKeyParam()}`;
  const res = await fetch(url);

  if (res.status === 429) {
    throw new Error('Google Books rate limit');
  }
  if (!res.ok) {
    throw new Error(`Google Books ${res.status}`);
  }

  const data = await res.json();
  return (data.items || [])
    .map((item: GoogleVolume) => mapVolume(item))
    .filter(Boolean) as SearchResult[];
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const local = searchCatalogBooks(query);

  try {
    const remote = hasApiKey() ? await fetchVolumes(query, 12) : [];
    const merged = dedupeById([...local, ...remote]);

    if (merged.length === 0) {
      warnDemo('búsqueda vacía');
      return CATALOG_BOOKS.slice(0, 8).map(toSearchResult);
    }

    return merged.slice(0, 14);
  } catch (error) {
    console.error(error);
    warnDemo('búsqueda');
    return local.length ? local : CATALOG_BOOKS.slice(0, 8).map(toSearchResult);
  }
}

export async function searchBooksBySubject(subject: string) {
  const needle = subject.replace(/_/g, ' ').toLowerCase();
  const local = CATALOG_BOOKS.filter((b) =>
    (b.genres || []).some((g) => g.includes(needle.replace(/\s+/g, '_')) || needle.includes(g)),
  );

  try {
    const remote = hasApiKey()
      ? await fetchVolumes(`subject:${subject.replace(/_/g, ' ')}`, 10)
      : [];
    const merged = dedupeById([...local.map(toSearchResult), ...remote]);
    return merged.map((r) => ({
      key: `/works/${r.id.replace(/^b_(isbn_|gb_)?/, '')}`,
      title: r.title,
      authors: [{ name: r.creator }],
      first_publish_year: Number(r.year) || undefined,
      cover_id: undefined as number | undefined,
      coverUrl: r.coverUrl,
    }));
  } catch (error) {
    console.error(error);
    warnDemo('subjects');
    return local.map((b) => ({
      key: `/works/${b.id.replace(/^b_/, '')}`,
      title: b.title,
      authors: [{ name: b.creator }],
      first_publish_year: Number(b.year) || undefined,
      cover_id: undefined as number | undefined,
      coverUrl: b.coverUrl,
    }));
  }
}

export async function getTrendingBooks() {
  const base = CATALOG_BOOKS.map((b) => ({
    id: b.id,
    title: b.title,
    creator: b.creator,
    year: b.year,
    coverUrl: b.coverUrl,
    genres: b.genres || ['fiction'],
    rating: b.rating ?? 4.4,
    author_name: [b.creator],
    key: b.id.replace(/^b_/, ''),
  }));

  if (hasApiKey()) {
    try {
      const extra = await fetchVolumes('subject:fiction', 8);
      const known = new Set(base.map((b) => b.title.toLowerCase()));
      for (const book of extra) {
        if (known.has(book.title.toLowerCase())) continue;
        base.push({
          id: book.id,
          title: book.title,
          creator: book.creator,
          year: book.year,
          coverUrl: book.coverUrl!,
          genres: book.genres || ['fiction'],
          rating: 4.2,
          author_name: [book.creator],
          key: book.id.replace(/^b_/, ''),
        });
        known.add(book.title.toLowerCase());

        if (base.length >= 24) {
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return base;
}

function cleanBookId(id: string) {
  return decodeURIComponent(id).replace(/^(b_isbn_|b_gb_|b_|gb_|isbn_)/, '');
}

export async function getBookDetails(id: string) {
  const cleanId = cleanBookId(id);
  const catalog = getCatalogBookById(id) || getCatalogBookById(cleanId);

  if (catalog) {
    if (hasApiKey()) {
      try {
        const results = await fetchVolumes(`isbn:${catalog.isbn}`, 1);
        const url = `${BASE}/volumes?q=${encodeURIComponent(`isbn:${catalog.isbn}`)}&maxResults=1${apiKeyParam()}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          const item = data.items?.[0] as GoogleVolume | undefined;
          const info = item?.volumeInfo;

          if (info) {
            return {
              title: catalog.title,
              description: info.description || `Sinopsis de ${catalog.title}.`,
              first_publish_date: catalog.year,
              pageCount: info.pageCount,
              covers: [] as number[],
              subjects: info.categories || catalog.genres,
              authors: [{ name: catalog.creator }],
              coverUrl: catalog.coverUrl,
              creator: catalog.creator,
              averageRating: info.averageRating || catalog.rating,
              ratingsCount: info.ratingsCount,
            };
          }
        }
        void results;
      } catch {
      }
    }

    return {
      title: catalog.title,
      description: `${catalog.title}, de ${catalog.creator}. Obra destacada del catálogo Page2Screen.`,
      first_publish_date: catalog.year,
      covers: [] as number[],
      subjects: catalog.genres,
      authors: [{ name: catalog.creator }],
      coverUrl: catalog.coverUrl,
      creator: catalog.creator,
      averageRating: catalog.rating,
    };
  }

  if (hasApiKey() && !cleanId.startsWith('OL')) {
    try {
      const qs = apiKeyParam().replace(/^&/, '');
      const res = await fetch(
        `${BASE}/volumes/${encodeURIComponent(cleanId)}${qs ? `?${qs}` : ''}`,
      );

      if (!res.ok) {
        throw new Error('Error detalle Google Books');
      }

      const item = (await res.json()) as GoogleVolume;
      const info = item.volumeInfo || {};
      const mapped = mapVolume(item);
      return {
        title: info.title || mapped?.title,
        description: info.description || 'Sin sinopsis disponible.',
        first_publish_date: info.publishedDate?.slice(0, 4) || mapped?.year,
        pageCount: info.pageCount,
        covers: [] as number[],
        subjects: info.categories || mapped?.genres || [],
        authors: (info.authors || []).map((name) => ({ name })),
        coverUrl: mapped?.coverUrl,
        creator: info.authors?.[0] || mapped?.creator,
        averageRating: info.averageRating,
        ratingsCount: info.ratingsCount,
      };
    } catch (error) {
      console.error(error);
    }
  }

  warnDemo('detalle');
  return null;
}
