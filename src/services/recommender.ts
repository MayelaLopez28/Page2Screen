import { discoverMoviesByGenre, searchMovies } from './tmdb';
import { searchBooks, searchBooksBySubject } from './openLibrary';
import type { Work, WorkType } from '../types';
import { genreMap } from '../constants/genreMap';
import { mockWorks } from '../data/mock';
import { findBridgeRule } from '../data/crossBridges';

export type CrossRecommendation = {
  suggestion: Partial<Work>;
  affinity: string;
  reason: string;
};

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
    reason: `Porque ${sourceWork.type === 'book' ? 'leíste' : 'viste'} ${sourceWork.title}, te sugerimos ${
      opposite === 'book' ? 'leer' : 'ver'
    } ${hit.title}.`,
  };
}

async function hydrateFromRule(
  rule: ReturnType<typeof findBridgeRule>,
  userLibraryIds: string[],
): Promise<CrossRecommendation | null> {
  if (!rule) {
    return null;
  }

  if (rule.targetType === 'book') {
    const results = await searchBooks(rule.targetQuery);
    const pick =
      results.find((b) => !userLibraryIds.includes(b.id)) ||
      results[0] ||
      null;

    if (!pick) {
      return {
        suggestion: {
          id: `b_bridge_${rule.targetTitle}`,
          type: 'book',
          title: rule.targetTitle,
          creator: rule.targetCreator,
          year: '',
          genres: [rule.affinity],
        },
        affinity: rule.affinity,
        reason: rule.reason,
      };
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

  const results = await searchMovies(rule.targetQuery);
  const pick =
    results.find((m) => !userLibraryIds.includes(m.id)) || results[0] || null;

  if (!pick) {
    return {
      suggestion: {
        id: `m_bridge_${rule.targetTitle}`,
        type: 'movie',
        title: rule.targetTitle,
        creator: rule.targetCreator,
        year: '',
        genres: [rule.affinity],
      },
      affinity: rule.affinity,
      reason: rule.reason,
    };
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

async function genreFallback(
  sourceWork: Work,
  userLibraryIds: string[],
): Promise<CrossRecommendation | null> {
  const genres = sourceWork.genres?.length ? sourceWork.genres : ['18'];

  if (sourceWork.type === 'movie') {
    for (const genre of genres) {
      const olSubject = resolveOlSubject(genre) || 'science_fiction';
      const books = await searchBooksBySubject(olSubject);
      const newBook = books.find((b: { key?: string; coverUrl?: string; title?: string }) => {
        const key = String(b.key || '').replace('/works/', '');
        const id = key.startsWith('b_') ? key : `b_gb_${key}`;
        return Boolean(b.title) && id !== 'b_gb_' && !userLibraryIds.includes(id);
      });

      if (newBook) {
        const key = String(newBook.key || '').replace('/works/', '');
        const bookId = key.startsWith('b_') ? key : `b_gb_${key}`;
        return {
          suggestion: {
            id: bookId,
            type: 'book',
            title: newBook.title,
            creator: newBook.authors?.[0]?.name || 'Autor Desconocido',
            year: newBook.first_publish_year?.toString() || '',
            coverUrl: newBook.coverUrl,
            genres: [olSubject],
          },
          affinity: affinityLabel(olSubject),
          reason: `Porque viste ${sourceWork.title}, te sugerimos este libro de ${affinityLabel(
            olSubject,
          )}.`,
        };
      }
    }
  } else {
    for (const genre of genres) {
      const tmdbGenreId = resolveTmdbGenre(genre) || '878';
      const movies = await discoverMoviesByGenre(tmdbGenreId);
      const newMovie = movies.find((m: { id?: number | string }) => {
        const id = `m_${m.id}`;
        return !userLibraryIds.includes(id);
      });

      if (newMovie) {
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
          affinity: affinityLabel(resolveOlSubject(tmdbGenreId) || 'drama'),
          reason: `Porque leíste ${sourceWork.title}, te sugerimos esta película de afinidad temática.`,
        };
      }
    }
  }

  return null;
}

export async function getCrossRecommendation(
  sourceWork: Work,
  userLibraryIds: string[],
): Promise<CrossRecommendation | null> {
  try {
    const rule = findBridgeRule(sourceWork.title, sourceWork.type);
    const fromRule = await hydrateFromRule(rule, userLibraryIds);
    if (fromRule) {
      return fromRule;
    }

    const fromGenre = await genreFallback(sourceWork, userLibraryIds);
    if (fromGenre) {
      return fromGenre;
    }

    return mockCross(sourceWork, userLibraryIds);
  } catch (error) {
    console.error('Error generando la sugerencia cruzada', error);
    return mockCross(sourceWork, userLibraryIds);
  }
}

export async function getCrossRecommendationsForLibrary(
  works: Work[],
  limit = 6,
): Promise<Array<CrossRecommendation & { source: Work }>> {
  const seeds = works.filter((w) => w.status === 'done').slice(0, 8);
  const fallbackSeeds =
    seeds.length > 0
      ? seeds
      : works.slice(0, 4).length > 0
        ? works.slice(0, 4)
        : mockWorks.filter((w) => w.status === 'done').slice(0, 4);

  const userIds = works.map((w) => w.id);
  const out: Array<CrossRecommendation & { source: Work }> = [];
  const seen = new Set<string>();

  for (const source of fallbackSeeds) {
    if (out.length >= limit) {
      break;
    }

    const rec = await getCrossRecommendation(source, userIds);

    if (!rec?.suggestion?.id || seen.has(rec.suggestion.id)) {
      continue;
    }

    seen.add(rec.suggestion.id);
    out.push({ ...rec, source });
  }

  return out;
}
