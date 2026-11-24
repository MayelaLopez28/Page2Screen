import { useEffect, useMemo, useState } from 'react';
import { discoverMoviesByGenre, getTrendingMovies } from '../services/tmdb';
import { getTrendingBooks } from '../services/openLibrary';
import {
  getCrossRecommendationsForLibrary,
  type CrossRecommendation,
} from '../services/recommender';
import { useLibrary } from '../context/LibraryContext';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import CrossBridge from '../components/recommendations/CrossBridge';
import WorkCard from '../components/works/WorkCard';
import { getDismissedRecIds, getRecSession } from '../utils/recommendationPrefs';
import {
  CATALOG_GENRES,
  type CatalogGenreId,
  genreLabel,
  getGenreFetchPlan,
  workMatchesGenre,
} from '../constants/catalogGenres';
import { CATALOG_BOOKS } from '../data/catalogBooks';
import { mockWorks } from '../data/mock';
import type { Work } from '../types';

type Filter = 'all' | 'book' | 'movie' | 'cross';
type Sort = 'rating' | 'title' | 'year';

function sortWorks(list: Work[], sort: Sort) {
  const sorted = [...list];
  if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  if (sort === 'year') sorted.sort((a, b) => Number(b.year) - Number(a.year));
  if (sort === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return sorted;
}

export default function ExplorePage() {
  const { works, currentUserId } = useLibrary();
  const [filter, setFilter] = useState<Filter>('all');
  const [genre, setGenre] = useState<CatalogGenreId>('all');
  const [sort, setSort] = useState<Sort>('rating');
  const [trending, setTrending] = useState<Work[]>([]);
  const [genreBoost, setGenreBoost] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);
  const [crossPairs, setCrossPairs] = useState<
    Array<CrossRecommendation & { source: Work }>
  >([]);
  const [crossLoading, setCrossLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [moviesData, booksData] = await Promise.all([
          getTrendingMovies(),
          getTrendingBooks(),
        ]);

        const movies: Work[] = (moviesData || []).slice(0, 18).map((m: Record<string, any>) => ({
          id: String(m.id).startsWith('m_') ? String(m.id) : `m_${m.id}`,
          type: 'movie' as const,
          title: m.title,
          creator: m.creator || 'Tendencia TMDB',
          year: m.release_date?.substring?.(0, 4) || m.year || '2024',
          coverUrl:
            m.coverUrl ||
            (m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined),
          genres: (m.genre_ids || m.genres || ['cine']).map(String),
          status: 'pending' as const,
          rating: 4.3,
          addedAt: Date.now(),
        }));

        const catalogByTitle = new Map(
          CATALOG_BOOKS.map((b) => [b.title.toLowerCase(), b]),
        );

        const books: Work[] = (booksData || [])
          .map((b: Record<string, any>) => {
            const rawId = String(b.id || b.key || '');
            const id = rawId.startsWith('b_')
              ? rawId
              : `b_isbn_${rawId.replace('/works/', '').replace(/^b_/, '')}`;
            const catalog = catalogByTitle.get(String(b.title || '').toLowerCase());
            return {
              id: catalog?.id || id,
              type: 'book' as const,
              title: b.title,
              creator: b.creator || b.author_name?.[0] || 'Autor Desconocido',
              year: b.year?.toString?.() || b.first_publish_year?.toString() || '2024',
              coverUrl: catalog?.coverUrl || b.coverUrl,
              coverFallbacks: catalog?.coverFallbacks,
              genres: b.genres?.length ? b.genres : catalog?.genres || ['fiction'],
              status: 'pending' as const,
              rating: typeof b.rating === 'number' ? b.rating : catalog?.rating ?? 4.4,
              addedAt: Date.now(),
            };
          })
          .filter((b) => Boolean(b.coverUrl));

        const moviesWithCover = movies.filter((m) => Boolean(m.coverUrl));
        // Libros populares primero en la grilla principal
        setTrending([...books, ...moviesWithCover]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (filter !== 'cross') {
      return;
    }

    let cancelled = false;
    setCrossLoading(true);
    const session = getRecSession(currentUserId);
    getCrossRecommendationsForLibrary(works, 8, {
      excludeSuggestionIds: getDismissedRecIds(currentUserId),
      sessionSalt: session,
    })
      .then((pairs) => {
        if (!cancelled) {
          setCrossPairs(pairs);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCrossLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filter, works, currentUserId]);

  // Al elegir un género, refuerza con catálogo local + discover TMDB + subjects.
  useEffect(() => {
    if (genre === 'all' || filter === 'cross') {
      setGenreBoost([]);
      return;
    }

    let cancelled = false;
    const plan = getGenreFetchPlan(genre);

    async function boost() {
      setGenreLoading(true);
      try {
        const seededBooks: Work[] = CATALOG_BOOKS.filter((b) =>
          workMatchesGenre(b.genres, genre),
        ).map((b) => ({
          id: b.id,
          type: 'book' as const,
          title: b.title,
          creator: b.creator,
          year: b.year,
          coverUrl: b.coverUrl,
          coverFallbacks: b.coverFallbacks,
          genres: b.genres || [genre],
          status: 'pending' as const,
          rating: b.rating ?? 4.3,
          addedAt: Date.now(),
        }));

        const seededMovies: Work[] = mockWorks
          .filter((w) => w.type === 'movie' && workMatchesGenre(w.genres, genre))
          .map((w) => ({
            ...w,
            genres: Array.from(new Set([...(w.genres || []), genre])),
            status: 'pending' as const,
            addedAt: Date.now(),
          }));

        const movieLists = await Promise.all(
          plan.tmdbIds.map((id) =>
            discoverMoviesByGenre(id).catch(() => [] as Record<string, unknown>[]),
          ),
        );

        if (cancelled) return;

        const movies: Work[] = movieLists
          .flat()
          .slice(0, 40)
          .map((m: Record<string, any>) => {
            const id = String(m.id).startsWith('m_') ? String(m.id) : `m_${m.id}`;
            const genreIds = (m.genre_ids || m.genres || []).map(String);
            return {
              id,
              type: 'movie' as const,
              title: m.title,
              creator: m.creator || 'Director (TMDB)',
              year: m.release_date?.substring?.(0, 4) || m.year || '',
              coverUrl:
                m.coverUrl ||
                (m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined),
              genres: Array.from(new Set([...genreIds, genre])),
              status: 'pending' as const,
              rating: 4.2,
              addedAt: Date.now(),
            };
          })
          .filter((m) => Boolean(m.coverUrl) && Boolean(m.title));

        // Libros: solo catálogo curado (portadas verificadas).
        setGenreBoost([...seededBooks, ...seededMovies, ...movies]);
      } finally {
        if (!cancelled) setGenreLoading(false);
      }
    }

    boost();
    return () => {
      cancelled = true;
    };
  }, [genre, filter]);

  const catalogPool = useMemo(() => {
    const map = new Map<string, Work>();
    for (const w of [...trending, ...genreBoost]) {
      if (!map.has(w.id)) map.set(w.id, w);
    }
    return [...map.values()];
  }, [trending, genreBoost]);

  const byGenre = useMemo(
    () =>
      catalogPool.filter(
        (w) => Boolean(w.coverUrl) && workMatchesGenre(w.genres, genre),
      ),
    [catalogPool, genre],
  );

  const books = useMemo(
    () => sortWorks(byGenre.filter((w) => w.type === 'book'), sort),
    [byGenre, sort],
  );
  const movies = useMemo(
    () => sortWorks(byGenre.filter((w) => w.type === 'movie'), sort),
    [byGenre, sort],
  );

  const filtered = useMemo(() => {
    if (filter === 'book') {
      return books;
    }

    if (filter === 'movie') {
      return movies;
    }

    if (filter === 'cross') {
      return sortWorks(catalogPool, sort);
    }
    return [...books, ...movies];
  }, [filter, books, movies, catalogPool, sort]);

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'book', label: 'Libros' },
    { id: 'movie', label: 'Películas' },
    { id: 'cross', label: 'Recomendaciones cruzadas' },
  ];

  const totalCount =
    filter === 'all'
      ? books.length + movies.length
      : filter === 'cross'
        ? crossPairs.length
        : filtered.length;

  const genreHeading =
    genre === 'all' ? null : ` · ${genreLabel(genre)}`;

  return (
    <div className="animate-in fade-in w-full">
      <section className="text-center w-full max-w-3xl mx-auto mb-10 lg:mb-12 pt-4">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[var(--text-primary)]">
          Explora el catálogo
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-mono">
          Descubre libros y películas, filtra por formato o género y comparte tu reseña.
        </p>
      </section>

      <div
        className="relative flex flex-wrap items-center justify-center gap-2 mb-4 py-3 border-y border-[var(--border-color)]"
        role="group"
        aria-label="Filtrar por formato"
      >
        {chips.map((chip) => {
          const active = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`pill ${active ? 'pill-active' : ''}`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {filter !== 'cross' ? (
        <div
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
          role="group"
          aria-label="Filtrar por género"
        >
          {CATALOG_GENRES.map((g) => {
            const active = genre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGenre(g.id)}
                className={`pill ${active ? 'pill-active' : ''}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <p className="label-mono text-[var(--text-secondary)]">
          {totalCount} obras{genreHeading}
        </p>
        <label className="inline-flex items-center gap-2 label-mono text-[var(--text-secondary)]">
          Ordenar:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] outline-none py-1"
          >
            <option value="rating">mejor valorados</option>
            <option value="title">título</option>
            <option value="year">año</option>
          </select>
        </label>
      </div>

      {loading || (genre !== 'all' && genreLoading && books.length + movies.length < 4) ? (
        <p
          className="text-center text-[var(--text-secondary)] label-mono py-16 animate-pulse"
          role="status"
          aria-live="polite"
        >
          Descubriendo obras...
        </p>
      ) : filter === 'cross' ? (
        crossLoading ? (
          <p
            className="text-center text-[var(--text-secondary)] label-mono py-16 animate-pulse"
            role="status"
            aria-live="polite"
          >
            Tejiendo puentes libro ↔ película...
          </p>
        ) : crossPairs.length === 0 ? (
          <p className="text-center text-sm font-mono text-[var(--text-secondary)] py-12">
            Marca una obra como por leer / por ver, o califica una terminada con 3.5★ o más,
            para ver puentes libro ↔ película.
          </p>
        ) : (
          <div className="space-y-10">
            <CrossBridge />
            <div className="grid-reco w-full">
              {crossPairs.map((pair) => {
                const work = pair.suggestion as Work;
                if (!work.id || !work.title || !work.type) return null;
                return (
                  <RecommendationCard
                    key={`${pair.source.id}-${work.id}`}
                    work={{
                      id: work.id,
                      type: work.type,
                      title: work.title,
                      creator: work.creator || 'Desconocido',
                      year: work.year || '',
                      coverUrl: work.coverUrl,
                      genres: work.genres || [pair.affinity],
                      status: 'pending',
                      rating: work.rating,
                      addedAt: Date.now(),
                    }}
                    source={pair.source}
                    reason={pair.reason}
                  />
                );
              })}
            </div>
          </div>
        )
      ) : filter === 'all' ? (
        <div className="space-y-14">
          <section aria-labelledby="sec-libros">
            <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
              <h2 id="sec-libros" className="font-heading text-2xl sm:text-3xl">
                Libros{genreHeading}
              </h2>
              <div className="flex items-center gap-3 shrink-0">
                <span className="label-mono text-[var(--text-secondary)]">
                  {books.length} libros
                </span>
                {books.length > 0 && (
                  <button
                    type="button"
                    aria-label="Ver todos los libros del catálogo"
                    className="label-mono text-[var(--text-primary)] underline underline-offset-4 hover:opacity-70"
                    onClick={() => {
                      setFilter('book');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Ver todos →
                  </button>
                )}
              </div>
            </div>
            {books.length === 0 ? (
              <p className="text-sm font-mono text-[var(--text-secondary)]">
                {genre === 'all'
                  ? 'Sin libros por ahora.'
                  : `No hay libros de ${genreLabel(genre)} en el catálogo.`}
              </p>
            ) : (
              <div className="grid-works w-full">
                {books.slice(0, 8).map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="sec-peliculas">
            <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
              <h2 id="sec-peliculas" className="font-heading text-2xl sm:text-3xl">
                Películas{genreHeading}
              </h2>
              <div className="flex items-center gap-3 shrink-0">
                <span className="label-mono text-[var(--text-secondary)]">
                  {movies.length} películas
                </span>
                {movies.length > 0 && (
                  <button
                    type="button"
                    aria-label="Ver todas las películas del catálogo"
                    className="label-mono text-[var(--text-primary)] underline underline-offset-4 hover:opacity-70"
                    onClick={() => {
                      setFilter('movie');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Ver todos →
                  </button>
                )}
              </div>
            </div>
            {movies.length === 0 ? (
              <p className="text-sm font-mono text-[var(--text-secondary)]">
                {genre === 'all'
                  ? 'Sin películas por ahora.'
                  : `No hay películas de ${genreLabel(genre)} en el catálogo.`}
              </p>
            ) : (
              <div className="grid-works w-full">
                {movies.slice(0, 8).map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            )}
          </section>

          <CrossBridge />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm font-mono text-[var(--text-secondary)] py-12">
          {genre === 'all'
            ? 'No hay obras en este filtro.'
            : `No hay obras de ${genreLabel(genre)} con este filtro.`}
        </p>
      ) : (
        <div className="grid-works w-full">
          {filtered.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
