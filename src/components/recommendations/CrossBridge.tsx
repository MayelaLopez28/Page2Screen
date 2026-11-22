import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Work } from '../../types';
import {
  getCrossRecommendationsForLibrary,
  type CrossRecommendation,
} from '../../services/recommender';
import { useLibrary } from '../../context/LibraryContext';
import { workPath } from '../../utils/routes';
import CoverImage from '../works/CoverImage';
import {
  dismissRecId,
  getDismissedRecIds,
  getRecSession,
} from '../../utils/recommendationPrefs';

type Pair = CrossRecommendation & { source: Work };

interface CrossBridgeProps {
  /** En perfil: permite rechazar y pasar a otra sugerencia */
  dismissible?: boolean;
}

export default function CrossBridge({ dismissible = false }: CrossBridgeProps) {
  const { works, currentUserId } = useLibrary();
  const [pair, setPair] = useState<Pair | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const session = getRecSession(currentUserId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const dismissed = getDismissedRecIds(currentUserId);
      const pairs = await getCrossRecommendationsForLibrary(works, 8, {
        excludeSuggestionIds: dismissed,
        sessionSalt: session + refreshToken,
      });

      if (cancelled) return;

      if (pairs.length === 0) {
        setPair(null);
        setLoading(false);
        return;
      }

      const index = (session + refreshToken) % pairs.length;
      setPair(pairs[index] || pairs[0]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [works, currentUserId, session, refreshToken]);

  const handleDismiss = () => {
    const suggestionId = pair?.suggestion?.id;
    if (!suggestionId) return;
    dismissRecId(currentUserId, suggestionId);
    setRefreshToken((n) => n + 1);
  };

  if (loading) {
    return (
      <section className="my-10 border border-[var(--border-color)] p-6 sm:p-8 animate-pulse">
        <p className="label-mono text-[var(--text-secondary)]">Buscando puente cultural...</p>
      </section>
    );
  }

  if (!pair?.suggestion?.title) {
    return dismissible ? (
      <section className="my-10 border border-dashed border-[var(--border-color)] p-6 sm:p-8">
        <p className="label-mono text-[var(--text-secondary)] mb-2">Recomendaciones cruzadas</p>
        <p className="text-sm font-mono text-[var(--text-secondary)]">
          No hay más sugerencias por ahora. Añade obras a por leer / por ver o vuelve a entrar
          más tarde.
        </p>
      </section>
    ) : null;
  }

  const { source, suggestion, affinity, reason } = pair;
  const targetType = suggestion.type || 'book';

  return (
    <section
      className="my-10 border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 sm:p-8"
      aria-labelledby="crossbridge-title"
    >
      <p className="label-mono text-[var(--text-secondary)] mb-2">
        Recomendaciones cruzadas para ti
      </p>
      <h2 id="crossbridge-title" className="font-heading text-2xl sm:text-3xl mb-2">
        Una historia lleva a otra
      </h2>
      <p className="text-sm font-mono text-[var(--text-secondary)] mb-8 max-w-2xl">{reason}</p>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
        <div className="flex-1 flex items-center gap-4 min-w-0 rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg-chip)]/30">
          <div className="w-16 h-24 overflow-hidden shrink-0 bg-[var(--bg-chip)] cover-spine">
            <CoverImage
              src={source.coverUrl}
              title={source.title}
              creator={source.creator}
              type={source.type}
              alt={`Referencia: ${source.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="label-mono text-[var(--text-primary)] mb-1">Referencia</p>
            <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
              {source.status === 'pending'
                ? source.type === 'book'
                  ? 'Porque añadiste a por leer'
                  : 'Porque añadiste a por ver'
                : source.type === 'book'
                  ? 'Porque leíste'
                  : 'Porque viste'}
            </p>
            <p className="font-heading text-lg leading-snug truncate">{source.title}</p>
            {source.status === 'done' && typeof source.rating === 'number' ? (
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                Tu nota: {source.rating.toFixed(1)} ★
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 gap-1 px-2">
          <span className="label-mono text-[var(--text-secondary)] text-[0.65rem]">
            {affinity || 'género'}
          </span>
          <span className="text-xl text-[var(--text-secondary)]" aria-hidden="true">
            →
          </span>
        </div>

        <div className="flex-1 flex items-center gap-4 min-w-0 rounded-lg border border-[var(--border-color)] p-3">
          <div className="w-16 h-24 overflow-hidden shrink-0 bg-[var(--bg-chip)] cover-spine">
            <CoverImage
              src={suggestion.coverUrl}
              title={suggestion.title || 'Sugerencia'}
              creator={suggestion.creator || ''}
              type={targetType}
              alt={`Recomendación: ${suggestion.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-mono text-[var(--text-primary)] mb-1">
              Te recomendamos {targetType === 'book' ? 'leer' : 'ver'}
            </p>
            <p className="font-heading text-lg leading-snug truncate">{suggestion.title}</p>
            {suggestion.creator ? (
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 truncate">
                {suggestion.creator}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 self-stretch lg:self-center w-full sm:w-auto">
          {suggestion.id && (
            <Link
              to={workPath(targetType, suggestion.id)}
              className="btn-solid justify-center"
            >
              Ver recomendación
            </Link>
          )}
          {dismissible ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="btn-outline justify-center min-h-11"
            >
              No me interesa
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
