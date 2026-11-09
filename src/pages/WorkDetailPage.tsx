import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { getMovieDetails } from '../services/tmdb';
import { getBookDetails } from '../services/openLibrary';
import StarRating from '../components/forms/StarRating';
import CoverImage from '../components/works/CoverImage';
import Toast from '../components/feedback/Toast';
import OpinionList from '../components/social/OpinionList';
import CrossSuggestionBox from '../components/recommendations/CrossSuggestionBox';
import { useRecommendation } from '../hooks/useRecommendation';
import { formatYear } from '../utils/format';
import type { Work, WorkType } from '../types';

type DetailView = {
  title: string;
  creator: string;
  year: string;
  coverUrl?: string;
  synopsis: string;
  genres: string[];
  average: string;
  type: WorkType;
  rawId: string;
  genreIds: string[];
};

export default function WorkDetailPage() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const { works, friends, profileName, addWork } = useLibrary();

  const [detail, setDetail] = useState<DetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const routeId = decodeURIComponent(id || '');
  const workId =
    tipo === 'pelicula'
      ? `m_${routeId}`
      : routeId.startsWith('OL')
        ? `b_${routeId}`
        : /^\d{10,13}$/.test(routeId.replace(/^isbn_/, ''))
          ? `b_isbn_${routeId.replace(/^isbn_/, '')}`
          : `b_gb_${routeId.replace(/^gb_/, '')}`;
  const localWork = works.find(
    (w) =>
      w.id === workId ||
      w.id === id ||
      w.id === `b_${routeId}` ||
      w.id === `b_isbn_${routeId}` ||
      w.id === routeId,
  );

  const seedWork: Work | null = detail
    ? {
        id: workId,
        type: detail.type,
        title: detail.title,
        creator: detail.creator,
        year: formatYear(detail.year),
        coverUrl: detail.coverUrl,
        genres: detail.genreIds.length ? detail.genreIds : detail.genres,
        status: localWork?.status || 'pending',
        addedAt: localWork?.addedAt || Date.now(),
      }
    : null;
  const { recommendation } = useRecommendation(seedWork);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        if (tipo === 'pelicula') {
          const data = await getMovieDetails(id!);

          if (!data) {
            setDetail(null);
            return;
          }

          const movie = data as Record<string, any>;
          setDetail({
            title: movie.title,
            creator:
              movie.credits?.crew?.find((c: { job: string }) => c.job === 'Director')?.name ||
              movie.creator ||
              'Director (TMDB)',
            year: movie.release_date || movie.year || '',
            coverUrl:
              movie.coverUrl ||
              (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined),
            synopsis: movie.overview || movie.notes || 'Sin sinopsis disponible.',
            genres: Array.isArray(movie.genres)
              ? movie.genres.map((g: string | { name: string }) =>
                  typeof g === 'string' ? g : g.name,
                )
              : [],
            average: movie.vote_average
              ? (Number(movie.vote_average) / 2).toFixed(1)
              : String(movie.rating || '0.0'),
            type: 'movie',
            rawId: id!,
            genreIds: Array.isArray(movie.genres)
              ? movie.genres.map((g: string | { id?: number }) =>
                  typeof g === 'string' ? g : String(g.id || ''),
                )
              : [],
          });
        } else if (tipo === 'libro') {
          const data = await getBookDetails(id!);

          if (!data) {
            setDetail(null);
            return;
          }

          const book = data as Record<string, any>;
          const authorName =
            book.creator ||
            book.authors?.[0]?.name ||
            (typeof book.authors?.[0] === 'string' ? book.authors[0] : null) ||
            'Autor Desconocido';
          const subjects = (book.subjects || []).slice(0, 6);
          const avg =
            typeof book.averageRating === 'number' ? book.averageRating.toFixed(1) : '4.0';
          setDetail({
            title: book.title,
            creator: authorName,
            year: book.first_publish_date || book.year || '',
            coverUrl:
              book.coverUrl ||
              (book.covers?.[0]
                ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
                : undefined),
            synopsis:
              typeof book.description === 'string'
                ? book.description.replace(/<[^>]+>/g, ' ')
                : book.description?.value || 'Sin sinopsis disponible.',
            genres: subjects.map((s: string) => String(s).replace(/_/g, ' ')),
            average: avg,
            type: 'book',
            rawId: routeId.startsWith('OL')
              ? routeId
              : /^\d{10,13}$/.test(routeId.replace(/^isbn_/, ''))
                ? `isbn_${routeId.replace(/^isbn_/, '')}`
                : `gb_${routeId.replace(/^gb_/, '')}`,
            genreIds: subjects.map((s: string) =>
              String(s).toLowerCase().replace(/\s+/g, '_'),
            ),
          });
        } else {
          setDetail(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [tipo, id]);

  const opinions = useMemo(() => {
    const list: { id: string; author: string; rating: number; text?: string }[] = [];
    if (localWork?.rating || localWork?.notes) {
      list.push({
        id: 'me',
        author: `${profileName} (tú)`,
        rating: localWork.rating || 0,
        text: localWork.notes,
      });
    }
    friends.forEach((friend) => {
      const shared = friend.recentWorks.find((w) => w.id === workId || w.title === detail?.title);
      if (shared && (shared.rating || shared.notes)) {
        list.push({
          id: friend.id,
          author: friend.name,
          rating: shared.rating || 0,
          text: shared.notes,
        });
      }
    });
    return list;
  }, [localWork, friends, profileName, workId, detail?.title]);

  const ratingBars = useMemo(() => {
    const avg = parseFloat(detail?.average || '0');
    return [5, 4, 3, 2, 1].map((star) => {
      const distance = Math.abs(avg - star);
      const weight = Math.max(0, 1 - distance / 3);
      return { star, count: Math.round(weight * 40 + (star === Math.round(avg) ? 20 : 0)) };
    });
  }, [detail?.average]);

  if (loading) {
    return <div className="py-20 text-center label-mono text-[var(--text-secondary)]">Cargando...</div>;
  }

  if (!detail) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="font-heading text-2xl">Obra no encontrada</p>
        <Link to="/" className="label-mono underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleQuickAdd = () => {
    addWork({
      id: `${detail.type === 'movie' ? 'm' : 'b'}_${detail.rawId}`,
      type: detail.type,
      title: detail.title,
      creator: detail.creator,
      year: formatYear(detail.year),
      coverUrl: detail.coverUrl,
      genres: detail.genreIds.length ? detail.genreIds : detail.genres,
      status: 'pending',
      addedAt: Date.now(),
    });
    setToastMsg(`✓ ${detail.title} guardada en tus pendientes`);
    setShowToast(true);
  };

  const handleCrossAdd = (suggested: Partial<Work>) => {
    if (!suggested.id || !suggested.type || !suggested.title) return;
    addWork({
      id: suggested.id,
      type: suggested.type,
      title: suggested.title,
      creator: suggested.creator || 'Desconocido',
      year: suggested.year || '',
      coverUrl: suggested.coverUrl,
      genres: suggested.genres || [],
      status: 'pending',
      addedAt: Date.now(),
    });
    setToastMsg(`✓ ${suggested.title} añadida a pendientes`);
    setShowToast(true);
  };

  const isBook = detail.type === 'book';
  const genreLabel = detail.genres[0] || (isBook ? 'Libro' : 'Película');
  const maxBar = Math.max(...ratingBars.map((b) => b.count), 1);

  return (
    <div className="animate-in fade-in pb-16">
      <nav className="label-mono text-[var(--text-secondary)] mb-8">
        <Link to="/" className="hover:text-[var(--text-primary)]">
          Catálogo
        </Link>
        <span> › </span>
        <span>{genreLabel}</span>
        <span> › </span>
        <span className="text-[var(--text-primary)]">{detail.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[minmax(240px,340px)_1fr] gap-10 lg:gap-16 items-start">
        <div className="aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0 bg-[var(--bg-chip)] cover-spine overflow-hidden">
          <CoverImage
            src={detail.coverUrl}
            title={detail.title}
            creator={detail.creator}
            type={detail.type}
            alt={`Portada de ${detail.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="label-mono text-[var(--text-secondary)] mb-3">
            {genreLabel} · {formatYear(detail.year)}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl leading-tight mb-2">{detail.title}</h1>
          <p className="font-heading italic text-xl text-[var(--text-secondary)] mb-8">
            de {detail.creator}
          </p>

          <div className="flex items-start gap-6 mb-8">
            <div>
              <p className="font-heading text-4xl tabular-nums">{detail.average}</p>
              <StarRating value={parseFloat(detail.average)} readonly size={16} />
              <p className="label-mono text-[var(--text-secondary)] mt-1">
                {opinions.length || 0} reseñas
              </p>
            </div>
            <div className="flex-1 space-y-1.5 max-w-xs">
              {ratingBars.map((bar) => (
                <div key={bar.star} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-8 text-[var(--text-secondary)]">{bar.star} ★</span>
                  <div className="flex-1 h-2 bg-[var(--bg-chip)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--text-primary)]"
                      style={{ width: `${(bar.count / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[var(--text-secondary)]">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="font-mono text-sm leading-relaxed text-[var(--text-primary)] space-y-4 mb-8 max-w-2xl">
            <p className="label-mono text-[var(--text-secondary)] mb-2">Sinopsis</p>
            <p>{detail.synopsis}</p>
          </div>

          {recommendation && (
            <div className="mb-8">
              <CrossSuggestionBox
                recommendation={recommendation}
                alreadyInList={Boolean(
                  recommendation.suggestion.id &&
                    works.some((w) => w.id === recommendation.suggestion.id),
                )}
                onQuickAdd={handleCrossAdd}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-12">
            <button
              type="button"
              onClick={() =>
                navigate('/anadir', {
                  state: {
                    prefill: {
                      id: `${detail.type === 'movie' ? 'm' : 'b'}_${detail.rawId}`,
                      type: detail.type,
                      title: detail.title,
                      creator: detail.creator,
                      year: formatYear(detail.year),
                      coverUrl: detail.coverUrl,
                      genres: detail.genreIds,
                    },
                  },
                })
              }
              className="btn-solid"
            >
              Escribir reseña
            </button>
            {!localWork ? (
              <button type="button" onClick={handleQuickAdd} className="btn-outline">
                Por {isBook ? 'leer' : 'ver'}
              </button>
            ) : (
              <span className="btn-outline opacity-60 pointer-events-none">En tu lista</span>
            )}
          </div>

          <section aria-labelledby="social-opinions" className="border-t border-[var(--border-color)] pt-8">
            <h2 id="social-opinions" className="font-heading text-2xl mb-6">
              Opiniones de tu círculo
            </h2>
            <OpinionList opinions={opinions} />
          </section>
        </div>
      </div>

      {showToast && (
        <Toast message={toastMsg || `✓ ${detail.title} guardada`} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
