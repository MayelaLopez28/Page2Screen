import { discoverMoviesByGenre, searchMovies } from './tmdb';
import { searchBooks, searchBooksBySubject } from './openLibrary';
import type { Work, WorkType } from '../types';
import { genreMap } from '../constants/genreMap';
import { mockWorks } from '../data/mock';
import { findBridgeRule, normalizeTitle } from '../data/crossBridges';
import { CATALOG_BOOKS } from '../data/catalogBooks';

export type CrossRecommendation = {
  suggestion: Partial<Work>;
  affinity: string;
  reason: string;
};

/** Reseñas terminadas solo cuentan si gustaron (≥ 3.5). Las pendientes sí disparan puente. */
export const MIN_RATING_FOR_CROSS = 3.5;

export function isEligibleCrossSeed(work: Work): boolean {
  if (work.status === 'pending') {
    return true;
  }
  if (work.status === 'done') {
    return typeof work.rating === 'number' && work.rating >= MIN_RATING_FOR_CROSS;
  }
  return false;
}

export function worksEligibleForCross(works: Work[]): Work[] {
  return works
    .filter(isEligibleCrossSeed)
    .sort((a, b) => {
      // Prioriza “por leer / por ver” recientes; luego mejor nota.
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.addedAt || 0) - (a.addedAt || 0);
    });
}

function seedVerb(sourceWork: Work) {
  if (sourceWork.status === 'pending') {
    return sourceWork.type === 'book' ? 'añadiste a por leer' : 'añadiste a por ver';
  }
  return sourceWork.type === 'book' ? 'leíste' : 'viste';
}

function normalizeSubject(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '_');
}

function resolveOlSubject(genre: string): string | null {
  if (genreMap.tmdbToOl[genre]) {
    return genreMap.tmdbToOl[genre];
  }

  const normalized = normalizeSubject(genre);

  if (genreMap.olToTmdb[normalized]) {
    return normalized;
  }

  const match = Object.keys(genreMap.olToTmdb).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );

  if (match) {
    return match;
  }

  if (normalized.includes('science') || normalized.includes('ciencia')) {
    return 'science_fiction';
  }

  if (normalized.includes('fantas')) {
    return 'fantasy';
  }

  if (normalized.includes('horror') || normalized.includes('terror')) {
    return 'horror';
  }

  if (normalized.includes('romance')) {
    return 'romance';
  }

  if (normalized.includes('myster') || normalized.includes('mister')) {
    return 'mystery_and_detective_stories';
  }
  return null;
}

function resolveTmdbGenre(genre: string): string | null {
  if (genreMap.olToTmdb[genre]) {
    return genreMap.olToTmdb[genre];
  }

  const normalized = normalizeSubject(genre);

  if (genreMap.olToTmdb[normalized]) {
    return genreMap.olToTmdb[normalized];
  }

  if (genreMap.tmdbToOl[genre]) {
    return genre;
  }

  const match = Object.keys(genreMap.olToTmdb).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );
  return match ? genreMap.olToTmdb[match] : null;
}

function affinityLabel(subject: string) {
  return subject.replace(/_/g, ' ');
}

function mockCross(sourceWork: Work, userLibraryIds: string[]): CrossRecommendation | null {
  const opposite: WorkType = sourceWork.type === 'movie' ? 'book' : 'movie';
  const hit =
    mockWorks.find((w) => w.type === opposite && !userLibraryIds.includes(w.id)) || null;

  if (!hit) {
    return null;
  }

  return {
    suggestion: hit,
    affinity: 'afinidad temática',
    reason: `Porque ${seedVerb(sourceWork)} ${sourceWork.title}, te sugerimos ${
      opposite === 'book' ? 'leer' : 'ver'
    } ${hit.title}.`,
  };
}

function catalogBookForRule(title: string, creator: string) {
  const nt = normalizeTitle(title);
  return (
    CATALOG_BOOKS.find((b) => normalizeTitle(b.title) === nt) ||
    CATALOG_BOOKS.find((b) => (b.aliases || []).some((a) => normalizeTitle(a) === nt)) ||
    CATALOG_BOOKS.find(
      (b) =>
        normalizeTitle(b.title).includes(nt) ||
        nt.includes(normalizeTitle(b.title)) ||
        normalizeTitle(b.creator) === normalizeTitle(creator),
    )
  );
}

function mockMovieForRule(title: string) {
  const nt = normalizeTitle(title);
  return mockWorks.find(
    (w) =>
      w.type === 'movie' &&
      (normalizeTitle(w.title) === nt ||
        (w.aliases || []).some((a) => normalizeTitle(a) === nt) ||
        normalizeTitle(w.title).includes(nt) ||
        nt.includes(normalizeTitle(w.title))),
  );
}

async function hydrateFromRule(
  rule: ReturnType<typeof findBridgeRule>,
  userLibraryIds: string[],
): Promise<CrossRecommendation | null> {
  if (!rule) {
    return null;
  }

  if (rule.targetType === 'book') {
    const catalog = catalogBookForRule(rule.targetTitle, rule.targetCreator);
    if (catalog && !userLibraryIds.includes(catalog.id)) {
      return {
        suggestion: {
          id: catalog.id,
          type: 'book',
          title: catalog.title,
          creator: catalog.creator,
          year: catalog.year,
          coverUrl: catalog.coverUrl,
          genres: catalog.genres?.length ? catalog.genres : [rule.affinity],
        },
        affinity: rule.affinity,
        reason: rule.reason,
      };
    }

    const results = await searchBooks(rule.targetTitle);
    const pick =
      results.find(
        (b) =>
          !userLibraryIds.includes(b.id) &&
          (normalizeTitle(b.title).includes(normalizeTitle(rule.targetTitle)) ||
            normalizeTitle(rule.targetTitle).includes(normalizeTitle(b.title))),
      ) ||
      results.find((b) => !userLibraryIds.includes(b.id)) ||
      results[0] ||
      null;

    if (!pick && catalog) {
      return {
        suggestion: {
          id: catalog.id,
          type: 'book',
          title: catalog.title,
          creator: catalog.creator,
          year: catalog.year,
          coverUrl: catalog.coverUrl,
          genres: catalog.genres || [rule.affinity],
        },
        affinity: rule.affinity,
        reason: rule.reason,
      };
    }

    if (!pick) {
      return null;
    }

    return {
      suggestion: {
        id: pick.id,
        type: 'book',
        title: pick.title || rule.targetTitle,
        creator: pick.creator || rule.targetCreator,
        year: pick.year,
        coverUrl: pick.coverUrl,
        genres: pick.genres?.length ? pick.genres : [rule.affinity],
      },
      affinity: rule.affinity,
      reason: rule.reason,
    };
  }

  const localMovie = mockMovieForRule(rule.targetTitle);
  if (localMovie && !userLibraryIds.includes(localMovie.id)) {
    return {
      suggestion: {
        id: localMovie.id,
        type: 'movie',
        title: localMovie.title,
        creator: localMovie.creator,
        year: localMovie.year,
        coverUrl: localMovie.coverUrl,
        genres: localMovie.genres?.length ? localMovie.genres : [rule.affinity],
      },
      affinity: rule.affinity,
      reason: rule.reason,
    };
  }

  const results = await searchMovies(rule.targetQuery);
  const pick =
    results.find((m) => !userLibraryIds.includes(m.id)) || results[0] || null;

  if (!pick && localMovie) {
    return {
      suggestion: {
        id: localMovie.id,
        type: 'movie',
        title: localMovie.title,
        creator: localMovie.creator,
        year: localMovie.year,
        coverUrl: localMovie.coverUrl,
        genres: localMovie.genres || [rule.affinity],
      },
      affinity: rule.affinity,
      reason: rule.reason,
    };
  }

  if (!pick) {
    return null;
  }

  return {
    suggestion: {
      id: pick.id,
      type: 'movie',
      title: pick.title || rule.targetTitle,
      creator: pick.creator || rule.targetCreator,
      year: pick.year,
      coverUrl: pick.coverUrl,
      genres: pick.genres?.length ? pick.genres : [rule.affinity],
    },
    affinity: rule.affinity,
    reason: rule.reason,
  };
}

/** Elección estable por id de la obra origen (evita que la API “salte” de título). */
function pickStableIndex(seed: string, length: number) {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function catalogBooksForSubject(olSubject: string) {
  const needle = normalizeSubject(olSubject);
  return CATALOG_BOOKS.filter((b) =>
    (b.genres || []).some(
      (g) =>
        normalizeSubject(g) === needle ||
        normalizeSubject(g).includes(needle) ||
        needle.includes(normalizeSubject(g)),
    ),
  ).sort((a, b) => a.title.localeCompare(b.title, 'es'));
}

async function genreFallback(
  sourceWork: Work,
  userLibraryIds: string[],
  excludeSuggestionIds: string[] = [],
  salt = '',
): Promise<CrossRecommendation | null> {
  const blocked = new Set([...userLibraryIds, ...excludeSuggestionIds]);
  const pickKey = salt ? `${sourceWork.id}::${salt}` : sourceWork.id;
  const genres = sourceWork.genres?.length ? sourceWork.genres : ['18'];

  if (sourceWork.type === 'movie') {
    for (const genre of genres) {
      const olSubject = resolveOlSubject(genre) || 'science_fiction';
      const label = affinityLabel(olSubject);

      const fromCatalog = catalogBooksForSubject(olSubject).filter((b) => !blocked.has(b.id));
      if (fromCatalog.length > 0) {
        const pick = fromCatalog[pickStableIndex(pickKey, fromCatalog.length)];
        return {
          suggestion: {
            id: pick.id,
            type: 'book',
            title: pick.title,
            creator: pick.creator,
            year: pick.year,
            coverUrl: pick.coverUrl,
            genres: pick.genres?.length ? pick.genres : [olSubject],
          },
          affinity: label,
          reason: `Porque ${seedVerb(sourceWork)} ${sourceWork.title}, te sugerimos este libro del género ${label}.`,
        };
      }

      const books = await searchBooksBySubject(olSubject);
      const candidates = books
        .map((b: { key?: string; coverUrl?: string; title?: string; authors?: { name: string }[]; first_publish_year?: number }) => {
          const key = String(b.key || '').replace('/works/', '');
          const bookId = key.startsWith('b_')
            ? key
            : /^\d{10,13}$/.test(key)
              ? `b_isbn_${key}`
              : `b_gb_${key}`;
          return { ...b, bookId };
        })
        .filter(
          (b: { title?: string; bookId: string; coverUrl?: string }) =>
            Boolean(b.title) && b.bookId !== 'b_gb_' && !blocked.has(b.bookId),
        );

      if (candidates.length > 0) {
        const newBook = candidates[pickStableIndex(pickKey, candidates.length)];
        return {
          suggestion: {
            id: newBook.bookId,
            type: 'book',
            title: newBook.title,
            creator: newBook.authors?.[0]?.name || 'Autor Desconocido',
            year: newBook.first_publish_year?.toString() || '',
            coverUrl: newBook.coverUrl,
            genres: [olSubject],
          },
          affinity: label,
          reason: `Porque ${seedVerb(sourceWork)} ${sourceWork.title}, te sugerimos este libro del género ${label}.`,
        };
      }
    }
  } else {
    for (const genre of genres) {
      const tmdbGenreId = resolveTmdbGenre(genre) || '878';
      const label = affinityLabel(resolveOlSubject(tmdbGenreId) || 'drama');
      const movies = await discoverMoviesByGenre(tmdbGenreId);
      const candidates = movies.filter((m: { id?: number | string }) => {
        const id = `m_${m.id}`;
        return !blocked.has(id);
      });

      if (candidates.length > 0) {
        const newMovie = candidates[pickStableIndex(pickKey, candidates.length)];
        return {
          suggestion: {
            id: `m_${newMovie.id}`,
            type: 'movie',
            title: newMovie.title,
            creator: 'Director (TMDB)',
            year:
              newMovie.release_date?.substring?.(0, 4) || String(newMovie.release_date || ''),
            coverUrl:
              newMovie.coverUrl ||
              (newMovie.poster_path
                ? `https://image.tmdb.org/t/p/w500${newMovie.poster_path}`
                : undefined),
            genres: [tmdbGenreId],
          },
          affinity: label,
          reason: `Porque ${seedVerb(sourceWork)} ${sourceWork.title}, te sugerimos esta película del género ${label}.`,
        };
      }
    }
  }

  return null;
}

export async function getCrossRecommendation(
  sourceWork: Work,
  userLibraryIds: string[],
  excludeSuggestionIds: string[] = [],
  salt = '',
): Promise<CrossRecommendation | null> {
  try {
    // Prioridad: género (no tramas). Los puentes por título solo si el género no da resultado.
    const fromGenre = await genreFallback(
      sourceWork,
      userLibraryIds,
      excludeSuggestionIds,
      salt,
    );
    if (fromGenre) {
      return fromGenre;
    }

    const rule = findBridgeRule(sourceWork.title, sourceWork.type);
    const fromRule = await hydrateFromRule(rule, userLibraryIds);
    if (fromRule?.suggestion?.id && excludeSuggestionIds.includes(fromRule.suggestion.id)) {
      return mockCross(sourceWork, [...userLibraryIds, ...excludeSuggestionIds]);
    }
    if (fromRule) {
      return fromRule;
    }

    return mockCross(sourceWork, [...userLibraryIds, ...excludeSuggestionIds]);
  } catch (error) {
    console.error('Error generando la sugerencia cruzada', error);
    return mockCross(sourceWork, [...userLibraryIds, ...excludeSuggestionIds]);
  }
}

export async function getCrossRecommendationsForLibrary(
  works: Work[],
  limit = 6,
  options?: { excludeSuggestionIds?: string[]; sessionSalt?: number },
): Promise<Array<CrossRecommendation & { source: Work }>> {
  const excludeSuggestionIds = options?.excludeSuggestionIds || [];
  const sessionSalt = options?.sessionSalt ?? 0;
  const eligible = worksEligibleForCross(works);
  if (eligible.length === 0) {
    return [];
  }

  // Rota el orden de semillas en cada sesión de login.
  const offset = eligible.length ? sessionSalt % eligible.length : 0;
  const seeds = [...eligible.slice(offset), ...eligible.slice(0, offset)].slice(0, 10);

  const userIds = works.map((w) => w.id);
  const out: Array<CrossRecommendation & { source: Work }> = [];
  const seen = new Set<string>(excludeSuggestionIds);

  for (const source of seeds) {
    if (out.length >= limit) {
      break;
    }

    const rec = await getCrossRecommendation(
      source,
      userIds,
      [...seen],
      String(sessionSalt),
    );

    if (!rec?.suggestion?.id || seen.has(rec.suggestion.id)) {
      continue;
    }

    seen.add(rec.suggestion.id);
    out.push({ ...rec, source });
  }

  return out;
}

export async function getSimilarByGenre(
  sourceWork: Work,
  excludeIds: string[],
  limit = 4,
): Promise<Work[]> {
  const blocked = new Set([sourceWork.id, ...excludeIds]);
  const genres = sourceWork.genres?.length ? sourceWork.genres : [];
  const results: Work[] = [];

  if (sourceWork.type === 'book') {
    for (const genre of genres.length ? genres : ['fiction']) {
      if (results.length >= limit) break;
      const olSubject = resolveOlSubject(genre) || normalizeSubject(genre) || 'fiction';

      for (const pick of catalogBooksForSubject(olSubject)) {
        if (blocked.has(pick.id) || results.some((r) => r.id === pick.id)) continue;
        results.push({
          id: pick.id,
          type: 'book',
          title: pick.title,
          creator: pick.creator,
          year: pick.year,
          coverUrl: pick.coverUrl,
          genres: pick.genres?.length ? pick.genres : [olSubject],
          status: 'pending',
          rating: pick.rating,
          addedAt: 0,
        });
        if (results.length >= limit) break;
      }

      if (results.length >= limit) break;

      const books = await searchBooksBySubject(olSubject);
      for (const b of books) {
        const key = String(b.key || '').replace('/works/', '');
        const bookId = key.startsWith('b_')
          ? key
          : /^\d{10,13}$/.test(key)
            ? `b_isbn_${key}`
            : `b_gb_${key}`;
        if (!b.title || bookId === 'b_gb_' || blocked.has(bookId) || results.some((r) => r.id === bookId)) {
          continue;
        }
        results.push({
          id: bookId,
          type: 'book',
          title: b.title,
          creator: b.authors?.[0]?.name || 'Autor Desconocido',
          year: b.first_publish_year?.toString() || '',
          coverUrl: b.coverUrl,
          genres: [olSubject],
          status: 'pending',
          addedAt: 0,
        });
        if (results.length >= limit) break;
      }
    }
  } else {
    for (const genre of genres.length ? genres : ['18']) {
      if (results.length >= limit) break;
      const tmdbGenreId = resolveTmdbGenre(genre) || '18';
      const movies = await discoverMoviesByGenre(tmdbGenreId);

      for (const m of movies) {
        const id = `m_${m.id}`;
        if (blocked.has(id) || results.some((r) => r.id === id)) continue;
        results.push({
          id,
          type: 'movie',
          title: m.title,
          creator: 'Director (TMDB)',
          year: m.release_date?.substring?.(0, 4) || String(m.release_date || ''),
          coverUrl:
            m.coverUrl ||
            (m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined),
          genres: [tmdbGenreId],
          status: 'pending',
          addedAt: 0,
        });
        if (results.length >= limit) break;
      }
    }
  }

  return results.slice(0, limit);
}
