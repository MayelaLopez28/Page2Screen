import { useEffect, useMemo, useState } from 'react';
import { getTrendingMovies } from '../services/tmdb';
import { getTrendingBooks } from '../services/openLibrary';
import {
  getCrossRecommendationsForLibrary,
  type CrossRecommendation,
} from '../services/recommender';
import { useLibrary } from '../context/LibraryContext';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import CrossBridge from '../components/recommendations/CrossBridge';
import WorkCard from '../components/works/WorkCard';
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
  const { works } = useLibrary();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('rating');
  const [trending, setTrending] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
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

        const movies: Work[] = (moviesData || []).slice(0, 10).map((m: Record<string, any>) => ({
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

        const books: Work[] = (booksData || []).map((b: Record<string, any>) => {
          const rawId = String(b.id || b.key || '');
          const id = rawId.startsWith('b_')
            ? rawId
            : `b_isbn_${rawId.replace('/works/', '').replace(/^b_/, '')}`;
          return {
            id,
            type: 'book' as const,
            title: b.title,
            creator: b.creator || b.author_name?.[0] || 'Autor Desconocido',
            year: b.year?.toString?.() || b.first_publish_year?.toString() || '2024',
            coverUrl: b.coverUrl,
            genres: b.genres?.length ? b.genres : ['fiction'],
            status: 'pending' as const,
            rating: typeof b.rating === 'number' ? b.rating : 4.4,
            addedAt: Date.now(),
          };
        });

        setTrending([...books, ...movies]);
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
    getCrossRecommendationsForLibrary(works, 8)
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
  }, [filter, works]);

  const books = useMemo(
    () => sortWorks(trending.filter((w) => w.type === 'book'), sort),
    [trending, sort],
  );
  const movies = useMemo(
    () => sortWorks(trending.filter((w) => w.type === 'movie'), sort),
    [trending, sort],
  );

  const filtered = useMemo(() => {
    if (filter === 'book') {
      return books;
    }

    if (filter === 'movie') {
      return movies;
    }

    if (filter === 'cross') {
      return sortWorks(trending, sort);
    }
    return [...books, ...movies];
  }, [filter, books, movies, trending, sort]);

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

  return (
    <div className="animate-in fade-in w-full">
      <section className="text-center w-full max-w-3xl mx-auto mb-10 lg:mb-12 pt-4">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[var(--text-primary)]">
          Explora el catálogo
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-mono">
          Descubre libros y películas, filtra por formato y comparte tu reseña.
        </p>
      </section>

      <div className="relative flex flex-wrap items-center justify-center gap-2 mb-8 py-3 border-y border-[var(--border-color)]">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <p className="label-mono text-[var(--text-secondary)]">{totalCount} obras</p>
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

      {loading ? (
        <p className="text-center text-[var(--text-secondary)] label-mono py-16 animate-pulse">
          Descubriendo obras...
        </p>
      ) : filter === 'cross' ? (
        crossLoading ? (
          <p className="text-center text-[var(--text-secondary)] label-mono py-16 animate-pulse">
            Tejiendo puentes libro ↔ película...
          </p>
        ) : crossPairs.length === 0 ? (
          <p className="text-center text-sm font-mono text-[var(--text-secondary)] py-12">
            Añade obras a tu biblioteca para recibir puentes personalizados.
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
                    reason={`${pair.reason} (por ${pair.source.title})`}
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
                Libros
              </h2>
              <span className="label-mono text-[var(--text-secondary)]">
                {books.length} libros
              </span>
            </div>
            {books.length === 0 ? (
              <p className="text-sm font-mono text-[var(--text-secondary)]">Sin libros por ahora.</p>
            ) : (
              <div className="grid-works w-full">
                {books.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="sec-peliculas">
            <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
              <h2 id="sec-peliculas" className="font-heading text-2xl sm:text-3xl">
                Películas
              </h2>
              <span className="label-mono text-[var(--text-secondary)]">
                {movies.length} películas
              </span>
            </div>
            {movies.length === 0 ? (
              <p className="text-sm font-mono text-[var(--text-secondary)]">
                Sin películas por ahora.
              </p>
            ) : (
              <div className="grid-works w-full">
                {movies.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            )}
          </section>

          <CrossBridge />
        </div>
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
