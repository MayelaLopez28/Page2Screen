import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { getMovieDetails } from '../services/tmdb';
import { getBookDetails } from '../services/openLibrary';
import StarRating from '../components/forms/StarRating';
import CoverImage from '../components/works/CoverImage';
import Toast from '../components/feedback/Toast';
import AuthPrompt from '../components/feedback/AuthPrompt';
import OpinionList from '../components/social/OpinionList';
import CrossSuggestionBox from '../components/recommendations/CrossSuggestionBox';
import SimilarWorks from '../components/recommendations/SimilarWorks';
import { useRecommendation } from '../hooks/useRecommendation';
import { useSimilarWorks } from '../hooks/useSimilarWorks';
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
  const location = useLocation();
  const { works, friends, profileName, addWork, updateWork, isLoggedIn } = useLibrary();

  const [detail, setDetail] = useState<DetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [editRequestKey, setEditRequestKey] = useState(0);
  const opinionsRef = useRef<HTMLElement | null>(null);

  const requireSession = (reason: string) => {
    setAuthPrompt(reason);
  };

  const authFrom = `${location.pathname}${location.search}`;

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
        addedAt: localWork?.addedAt || 0,
      }
    : null;
  const { recommendation } = useRecommendation(seedWork);
  const { items: similarItems, loading: similarLoading } = useSimilarWorks(seedWork, 4);

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

  /** Promedio y barras: base API + calificaciones del círculo (las tuyas se suman al editar). */
  const { displayAverage, reviewCount, ratingBars } = useMemo(() => {
    const apiAvg = parseFloat(detail?.average || '0') || 0;
    const BASE_VOTES = apiAvg > 0 ? 12 : 0;
    const circleRatings = opinions
      .map((o) => o.rating)
      .filter((r): r is number => typeof r === 'number' && r > 0);

    const baseSum = apiAvg * BASE_VOTES;
    const circleSum = circleRatings.reduce((acc, r) => acc + r, 0);
    const totalVotes = BASE_VOTES + circleRatings.length;
    const average =
      totalVotes > 0 ? (baseSum + circleSum) / totalVotes : 0;

    const bars = [5, 4, 3, 2, 1].map((star) => {
      const distance = Math.abs(apiAvg - star);
      const weight = Math.max(0, 1 - distance / 3);
      let count =
        BASE_VOTES > 0
          ? Math.round(weight * (BASE_VOTES * 0.7) + (star === Math.round(apiAvg) ? BASE_VOTES * 0.3 : 0))
          : 0;
      circleRatings.forEach((r) => {
        if (Math.round(r) === star) count += 1;
      });
      return { star, count };
    });

    return {
      displayAverage: average > 0 ? average.toFixed(1) : '0.0',
      reviewCount: totalVotes,
      ratingBars: bars,
    };
  }, [detail?.average, opinions]);

  if (loading) {
    return (
      <div
        className="py-20 text-center label-mono text-[var(--text-secondary)]"
        role="status"
        aria-live="polite"
      >
        Cargando...
      </div>
    );
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
    if (!isLoggedIn) {
      requireSession('¿Quieres guardar esta obra en tu lista? Inicia sesión o crea una cuenta.');
      return;
    }
    addWork({
      id: workId,
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
    if (!isLoggedIn) {
      requireSession('¿Quieres guardar esta obra en tu lista? Inicia sesión o crea una cuenta.');
      return;
    }
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

  const openOpinionEditor = () => {
    if (!isLoggedIn) {
      requireSession('¿Quieres escribir una reseña? Inicia sesión o crea una cuenta.');
      return;
    }
    setEditRequestKey((n) => n + 1);
    window.requestAnimationFrame(() => {
      opinionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const goWriteReview = () => {
    if (!isLoggedIn) {
      requireSession('¿Quieres escribir una reseña? Inicia sesión o crea una cuenta.');
      return;
    }
    navigate('/anadir', {
      state: {
        lockedReview: true,
        prefill: {
          id: workId,
          type: detail!.type,
          title: detail!.title,
          creator: detail!.creator,
          year: formatYear(detail!.year),
          coverUrl: detail!.coverUrl,
          genres: detail!.genreIds,
        },
      },
    });
  };

  const handleSaveOpinion = (rating: number, text: string) => {
    if (!isLoggedIn) {
      requireSession('¿Quieres guardar tu reseña? Inicia sesión o crea una cuenta.');
      return;
    }
    const now = Date.now();
    if (localWork) {
      const prevCount = localWork.consumedCount || (localWork.status === 'done' ? 1 : 0);
      const dates =
        localWork.consumptionDates?.length
          ? localWork.consumptionDates
          : localWork.status === 'done'
            ? [localWork.addedAt || now]
            : [now];
      updateWork(localWork.id, {
        rating,
        notes: text || undefined,
        status: 'done',
        consumedCount: Math.max(1, prevCount),
        consumptionDates: dates,
      });
    } else {
      addWork({
        id: workId,
        type: detail.type,
        title: detail.title,
        creator: detail.creator,
        year: formatYear(detail.year),
        coverUrl: detail.coverUrl,
        genres: detail.genreIds.length ? detail.genreIds : detail.genres,
        status: 'done',
        rating,
        notes: text || undefined,
        consumedCount: 1,
        consumptionDates: [now],
        addedAt: now,
      });
    }
    setToastMsg('✓ Opinión y calificación actualizadas');
    setShowToast(true);
  };

  const handleReconsume = () => {
    if (!isLoggedIn) {
      requireSession('¿Quieres registrar esta obra otra vez? Inicia sesión o crea una cuenta.');
      return;
    }
    if (!localWork) return;
    const now = Date.now();
    const prev = localWork.consumedCount || 1;
    const prevDates =
      localWork.consumptionDates?.length
        ? localWork.consumptionDates
        : [localWork.addedAt || now];
    updateWork(localWork.id, {
      status: 'done',
      consumedCount: prev + 1,
      consumptionDates: [...prevDates, now],
      addedAt: now,
    });
    setToastMsg(
      isBook
        ? '✓ Nueva lectura registrada. Puedes cambiar tu nota o dejarla igual.'
        : '✓ Nuevo visionado registrado. Puedes cambiar tu nota o dejarla igual.',
    );
    setShowToast(true);
    openOpinionEditor();
  };

  const isBook = detail.type === 'book';
  const genreLabel = detail.genres[0] || (isBook ? 'Libro' : 'Película');
  const maxBar = Math.max(...ratingBars.map((b) => b.count), 1);

  return (
    <div className="animate-in fade-in pb-16">
      <nav
        aria-label="Migas de pan"
        className="label-mono text-[var(--text-secondary)] mb-8 sm:mb-10"
      >
        <Link to="/" className="hover:text-[var(--text-primary)]">
          Catálogo
        </Link>
        <span> › </span>
        <span>{genreLabel}</span>
        <span> › </span>
        <span className="text-[var(--text-primary)]">{detail.title}</span>
      </nav>

      <div className="detail-layout">
        <div className="detail-cover cover-spine">
          <CoverImage
            src={detail.coverUrl}
            title={detail.title}
            creator={detail.creator}
            type={detail.type}
            alt={`Portada de ${detail.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 w-full">
          <div className="border-b border-[var(--border-color)] pb-4 sm:pb-8">
            <p className="label-mono text-[var(--text-secondary)] mb-2">
              {genreLabel} · {formatYear(detail.year)}
            </p>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] tracking-tight mb-2">
              {detail.title}
            </h1>
            <p className="font-heading italic text-base sm:text-xl text-[var(--text-secondary)]">
              de {detail.creator}
            </p>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 sm:gap-10 py-5 sm:py-6 border-b border-[var(--border-color)]">
            <div>
              <p className="font-heading text-4xl tabular-nums leading-none">{displayAverage}</p>
              <StarRating value={parseFloat(displayAverage)} readonly size={16} />
              <p className="label-mono text-[var(--text-secondary)] mt-2">
                {reviewCount} {reviewCount === 1 ? 'valoración' : 'valoraciones'}
              </p>
            </div>
            <div className="space-y-2 w-full max-w-md" aria-label="Distribución de calificaciones">
              {ratingBars.map((bar) => (
                <div key={bar.star} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-8 text-[var(--text-secondary)]">{bar.star} ★</span>
                  <div
                    className="flex-1 h-2 bg-[var(--bg-chip)] overflow-hidden"
                    role="img"
                    aria-label={`${bar.count} valoraciones de ${bar.star} estrellas`}
                  >
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

          <section
            aria-labelledby="synopsis-heading"
            className="py-7 sm:py-9 max-w-3xl xl:max-w-4xl border-b border-[var(--border-color)]"
          >
            <h2 id="synopsis-heading" className="label-mono text-[var(--text-secondary)] mb-3">
              Sinopsis
            </h2>
            <p className="font-mono text-sm sm:text-[0.95rem] leading-7 sm:leading-8 text-left text-[var(--text-primary)]">
              {detail.synopsis}
            </p>
          </section>

          <div className="py-7 sm:py-9 space-y-4">
            {localWork?.status === 'done' ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="pill pill-active pointer-events-none">
                    {isBook ? 'Ya leíste' : 'Ya viste'}
                    {(localWork.consumedCount || 1) > 1
                      ? ` · ${localWork.consumedCount} veces`
                      : ''}
                  </span>
                  {typeof localWork.rating === 'number' && localWork.rating > 0 ? (
                    <StarRating value={localWork.rating} readonly size={18} />
                  ) : null}
                </div>
                <p className="text-sm font-mono text-[var(--text-secondary)]">
                  Ya {isBook ? 'la leíste' : 'la viste'}. Si {isBook ? 'la leíste' : 'la viste'}{' '}
                  otra vez, regístralo: podrás cambiar tu calificación y comentario, o dejarlos
                  como están.
                </p>
                <div className="flex flex-row flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReconsume}
                    className="btn-solid min-h-11 px-5 shrink-0"
                  >
                    Volví a {isBook ? 'leerla' : 'verla'}
                  </button>
                </div>
              </>
            ) : localWork?.status === 'pending' ? (
              <div className="flex flex-row flex-wrap items-center gap-3">
                <span className="pill pointer-events-none shrink-0">
                  En tu lista · {isBook ? 'Por leer' : 'Por ver'}
                </span>
                <button
                  type="button"
                  onClick={goWriteReview}
                  className="btn-solid min-h-11 px-5 shrink-0"
                >
                  Escribir reseña
                </button>
                <button
                  type="button"
                  onClick={openOpinionEditor}
                  className="btn-outline min-h-11 px-5 shrink-0"
                >
                  Marcar como {isBook ? 'leída' : 'vista'}
                </button>
              </div>
            ) : localWork?.status === 'dnf' ? (
              <div className="flex flex-row flex-wrap items-center gap-3">
                <span className="pill pointer-events-none shrink-0">Lo dejaste (DNF)</span>
                <button
                  type="button"
                  onClick={openOpinionEditor}
                  className="btn-solid min-h-11 px-5 shrink-0"
                >
                  Actualizar opinión
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="btn-outline min-h-11 px-5 shrink-0"
                >
                  Volver a {isBook ? 'por leer' : 'por ver'}
                </button>
              </div>
            ) : (
              <div className="flex flex-row flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={goWriteReview}
                  className="btn-solid min-h-11 px-5 shrink-0"
                >
                  Escribir reseña
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="btn-outline min-h-11 px-5 shrink-0"
                >
                  {isBook ? 'Por leer' : 'Por ver'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 border-t border-[var(--border-color)]">
        <SimilarWorks
          sourceTitle={detail.title}
          type={detail.type}
          items={similarItems}
          loading={similarLoading}
        />

        {recommendation?.suggestion?.id && seedWork && (
          <div className="py-7 sm:py-9 border-b border-[var(--border-color)]">
            <CrossSuggestionBox
              recommendation={recommendation}
              source={seedWork}
              alreadyInList={Boolean(
                recommendation.suggestion.id &&
                  works.some((w) => w.id === recommendation.suggestion.id),
              )}
              onQuickAdd={handleCrossAdd}
            />
          </div>
        )}

        <section
          ref={opinionsRef}
          aria-labelledby="social-opinions"
          className="border-t border-[var(--border-color)] pt-8 max-w-3xl xl:max-w-4xl"
        >
          <h2 id="social-opinions" className="font-heading text-3xl sm:text-4xl mb-7">
            Opiniones de tu círculo
          </h2>
          <OpinionList
            opinions={opinions}
            editableId={isLoggedIn ? 'me' : undefined}
            canCreate={isLoggedIn}
            onSaveOpinion={isLoggedIn ? handleSaveOpinion : undefined}
            editRequestKey={editRequestKey}
          />
        </section>
      </div>

      {showToast && (
        <Toast
          message={toastMsg || `✓ ${detail.title} guardada`}
          onClose={() => setShowToast(false)}
        />
      )}
      {authPrompt ? (
        <AuthPrompt
          message={authPrompt}
          from={authFrom}
          onClose={() => setAuthPrompt(null)}
        />
      ) : null}
    </div>
  );
}
