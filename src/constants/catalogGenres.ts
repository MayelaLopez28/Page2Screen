import { genreMap } from './genreMap';

/** Géneros del catálogo (libros + películas). */
export type CatalogGenreId =
  | 'all'
  | 'horror'
  | 'romance'
  | 'fantasy'
  | 'science_fiction'
  | 'fiction'
  | 'mystery'
  | 'thriller'
  | 'drama'
  | 'adventure'
  | 'young_adult';

export type CatalogGenre = {
  id: CatalogGenreId;
  label: string;
  /** Tokens en work.genres (slug, nombre o id TMDB). */
  tokens: string[];
  /** IDs TMDB para discover al filtrar. */
  tmdbIds: string[];
  /** Subjects Open Library / Google Books. */
  bookSubjects: string[];
};

export const CATALOG_GENRES: CatalogGenre[] = [
  { id: 'all', label: 'Todos los géneros', tokens: [], tmdbIds: [], bookSubjects: [] },
  {
    id: 'horror',
    label: 'Terror',
    tokens: ['horror', 'terror', '27'],
    tmdbIds: ['27'],
    bookSubjects: ['horror', 'terror'],
  },
  {
    id: 'romance',
    label: 'Romance',
    tokens: ['romance', 'love_stories', '10749'],
    tmdbIds: ['10749'],
    bookSubjects: ['romance', 'love stories', 'contemporary romance'],
  },
  {
    id: 'fantasy',
    label: 'Fantasía',
    tokens: ['fantasy', 'fantasía', 'fantasia', 'fantasy_fiction', '14'],
    tmdbIds: ['14'],
    bookSubjects: ['fantasy', 'fantasy fiction', 'epic fantasy'],
  },
  {
    id: 'science_fiction',
    label: 'Ciencia ficción',
    tokens: [
      'science_fiction',
      'sci-fi',
      'science-fiction',
      'ciencia_ficcion',
      'dystopia',
      'distopia',
      'cyberpunk',
      '878',
    ],
    tmdbIds: ['878'],
    bookSubjects: ['science fiction', 'dystopia', 'space opera'],
  },
  {
    id: 'fiction',
    label: 'Ficción',
    tokens: [
      'fiction',
      'ficcion',
      'literary_fiction',
      'literary fiction',
      'drama',
      'romance',
      'mystery',
      'thriller',
    ],
    tmdbIds: ['18'],
    bookSubjects: ['fiction', 'literary fiction', 'contemporary fiction'],
  },
  {
    id: 'mystery',
    label: 'Misterio',
    tokens: [
      'mystery',
      'misterio',
      'mystery_and_detective_stories',
      'detective',
      'crime',
      '9648',
      '80',
    ],
    tmdbIds: ['9648', '80'],
    bookSubjects: ['mystery', 'detective', 'crime fiction'],
  },
  {
    id: 'thriller',
    label: 'Suspense',
    tokens: ['thriller', 'suspense', 'psychological_thriller', '53'],
    tmdbIds: ['53'],
    bookSubjects: ['thriller', 'suspense', 'psychological thriller'],
  },
  {
    id: 'drama',
    label: 'Drama',
    tokens: ['drama', 'literary_fiction', 'literary fiction', '18'],
    tmdbIds: ['18'],
    bookSubjects: ['drama', 'literary fiction', 'contemporary fiction'],
  },
  {
    id: 'adventure',
    label: 'Aventura',
    tokens: ['adventure', 'aventura', 'adventure_stories', '12'],
    tmdbIds: ['12'],
    bookSubjects: ['adventure', 'adventure stories', 'action adventure'],
  },
  {
    id: 'young_adult',
    label: 'Juvenil',
    tokens: [
      'young_adult',
      'young_adult_fiction',
      'ya',
      'juvenil',
      'juvenile_fiction',
      'teen_fiction',
      '10751',
    ],
    // TMDB no tiene YA: familia + aventura + fantasía + animación
    tmdbIds: ['10751', '12', '14', '16'],
    bookSubjects: ['young adult', 'juvenile fiction', 'teen fiction'],
  },
];

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function expandWorkGenreTokens(genres: string[]): Set<string> {
  const out = new Set<string>();

  for (const raw of genres) {
    const token = normalizeToken(String(raw));
    if (!token) continue;
    out.add(token);

    const asOl = genreMap.tmdbToOl[raw] || genreMap.tmdbToOl[token];
    if (asOl) out.add(normalizeToken(asOl));

    const asTmdb = genreMap.olToTmdb[token] || genreMap.olToTmdb[raw];
    if (asTmdb) out.add(String(asTmdb));
  }

  return out;
}

export function workMatchesGenre(
  genres: string[] | undefined,
  genreId: CatalogGenreId,
): boolean {
  if (genreId === 'all') return true;
  const def = CATALOG_GENRES.find((g) => g.id === genreId);
  if (!def || !genres?.length) return false;

  const workTokens = expandWorkGenreTokens(genres);
  const needles = new Set([
    ...def.tokens.map(normalizeToken),
    ...def.tmdbIds.map(String),
    genreId,
    normalizeToken(genreId),
  ]);

  const filterTmdb = genreMap.olToTmdb[genreId];
  if (filterTmdb) needles.add(String(filterTmdb));

  for (const needle of needles) {
    if (!needle) continue;
    if (workTokens.has(needle)) return true;
  }
  return false;
}

export function genreLabel(genreId: CatalogGenreId) {
  return CATALOG_GENRES.find((g) => g.id === genreId)?.label || genreId;
}

export function getGenreFetchPlan(genreId: CatalogGenreId) {
  const def = CATALOG_GENRES.find((g) => g.id === genreId);
  if (!def || genreId === 'all') {
    return { tmdbIds: [] as string[], bookSubjects: [] as string[] };
  }
  return { tmdbIds: def.tmdbIds, bookSubjects: def.bookSubjects };
}
