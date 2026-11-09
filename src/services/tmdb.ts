import type { SearchResult, Work } from '../types';
import { mockWorks } from '../data/mock';
import { dedupeById, matchesQuery } from '../utils/searchMatch';

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
const BASE_URL = (import.meta.env.VITE_TMDB_PROXY as string | undefined) || 'https://api.themoviedb.org/3';

const OPTIONS: RequestInit = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    ...(TMDB_TOKEN ? { Authorization: `Bearer ${TMDB_TOKEN}` } : {}),
  },
};

export const isTmdbMockMode = !TMDB_TOKEN && !import.meta.env.VITE_TMDB_PROXY;

function warnDemo(context: string) {
  console.warn(`[Page2Screen] Modo demostración TMDB (${context}): usando datos mock.`);
}

function mapMockMovies(query?: string): SearchResult[] {
  return mockWorks
    .filter(
      (w) =>
        w.type === 'movie' &&
        (!query || matchesQuery(query, w.title, ...(w.aliases || []))),
    )
    .map((w) => ({
      id: w.id,
      type: 'movie' as const,
      title: w.title,
      creator: w.creator,
      year: w.year,
      coverUrl: w.coverUrl,
      genres: w.genres,
    }));
}

async function fetchMovieSearch(query: string, language: string): Promise<SearchResult[]> {
  const res = await fetch(
    `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=${language}&page=1&include_adult=false`,
    OPTIONS,
  );

  if (!res.ok) {
    throw new Error(`Error en TMDB search (${language})`);
  }

  const data = await res.json();
  return (data.results || []).map(mapMovieResult);
}

function mapMovieResult(m: {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  genre_ids?: number[];
}): SearchResult {
  return {
    id: `m_${m.id}`,
    type: 'movie',
    title: m.title,
    creator: 'Director (TMDB)',
    year: m.release_date?.substring(0, 4) || 'Desc.',
    coverUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
    genres: m.genre_ids?.map(String) || [],
  };
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (isTmdbMockMode) {
    warnDemo('búsqueda');
    return mapMockMovies(query);
  }

  try {
    const [esResults, enResults] = await Promise.all([
      fetchMovieSearch(query, 'es-MX'),
      fetchMovieSearch(query, 'en-US'),
    ]);
    return dedupeById([...esResults, ...enResults]).slice(0, 12);
  } catch (error) {
    console.error(error);
    warnDemo('búsqueda tras error');
    return mapMockMovies(query);
  }
}

export async function getTrendingMovies() {
  if (isTmdbMockMode) {
    warnDemo('trending');
    return mockWorks.filter((w) => w.type === 'movie');
  }

  try {
    const res = await fetch(`${BASE_URL}/trending/movie/week?language=es-MX`, OPTIONS);

    if (!res.ok) {
      throw new Error('Error en TMDB trending');
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(error);
    warnDemo('trending tras error');
    return mockWorks.filter((w) => w.type === 'movie');
  }
}

export async function discoverMoviesByGenre(genreId: string) {
  if (isTmdbMockMode) {
    warnDemo('discover');
    return mockWorks
      .filter((w) => w.type === 'movie' && w.genres.includes(genreId))
      .map((w) => ({
        id: Number(w.id.replace('m_', '')),
        title: w.title,
        release_date: w.year,
        poster_path: null as string | null,
        genre_ids: w.genres.map(Number),
        coverUrl: w.coverUrl,
      }));
  }

  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?with_genres=${genreId}&language=es-MX&sort_by=popularity.desc&vote_count.gte=3000`,
      OPTIONS,
    );

    if (!res.ok) {
      throw new Error('Error en TMDB discover');
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(error);
    warnDemo('discover tras error');
    return mockWorks
      .filter((w) => w.type === 'movie' && w.genres.includes(genreId))
      .map((w) => ({
        id: Number(w.id.replace('m_', '')),
        title: w.title,
        release_date: w.year,
        poster_path: null as string | null,
        genre_ids: w.genres.map(Number),
        coverUrl: w.coverUrl,
      }));
  }
}

export async function getMovieDetails(id: string): Promise<Work | Record<string, unknown> | null> {
  const cleanId = id.replace('m_', '');

  if (isTmdbMockMode) {
    warnDemo('detalle');
    const mock = mockWorks.find((w) => w.id === `m_${cleanId}` || w.id === id);

    if (!mock) {
      return null;
    }

    return {
      ...mock,
      title: mock.title,
      overview: mock.notes || 'Sinopsis de demostración.',
      release_date: mock.year,
      poster_path: null,
      backdrop_path: null,
      coverUrl: mock.coverUrl,
      vote_average: (mock.rating || 4) * 2,
      genres: mock.genres.map((g) => ({ id: Number(g) || 0, name: g })),
      credits: { crew: [{ job: 'Director', name: mock.creator }] },
    };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/movie/${cleanId}?append_to_response=credits&language=es-MX`,
      OPTIONS,
    );

    if (!res.ok) {
      throw new Error('Error obteniendo detalle de TMDB');
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    warnDemo('detalle tras error');
    const mock = mockWorks.find((w) => w.id === `m_${cleanId}` || w.id === id);
    return mock
      ? {
          ...mock,
          overview: mock.notes || 'Sinopsis de demostración.',
          release_date: mock.year,
          vote_average: (mock.rating || 4) * 2,
          genres: mock.genres.map((g) => ({ id: Number(g) || 0, name: g })),
          credits: { crew: [{ job: 'Director', name: mock.creator }] },
        }
      : null;
  }
}
