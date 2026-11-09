import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Work } from '../../types';
import {
  getCrossRecommendation,
  type CrossRecommendation,
} from '../../services/recommender';
import { useLibrary } from '../../context/LibraryContext';
import { workPath } from '../../utils/routes';
import CoverImage from '../works/CoverImage';
import { mockWorks } from '../../data/mock';

export default function CrossBridge() {
  const { works } = useLibrary();
  const [pair, setPair] = useState<(CrossRecommendation & { source: Work }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendation() {
      setLoading(true);
      const seed =
        works.find((w) => w.status === 'done') ||
        works[0] ||
        mockWorks.find((w) => w.type === 'movie' && w.title.toLowerCase().includes('interstellar')) ||
        mockWorks[0];

      if (!seed) {
        if (!cancelled) {
          setPair(null);
          setLoading(false);
        }
        return;
      }

      const userIds = works.map((w) => w.id);
      const rec = await getCrossRecommendation(seed, userIds);

      if (!cancelled) {
        setPair(rec ? { ...rec, source: seed } : null);
        setLoading(false);
      }
    }

    fetchRecommendation();
    return () => {
      cancelled = true;
    };
  }, [works]);

  if (loading) {
    return (
      <section className="my-10 border border-[var(--border-color)] p-6 sm:p-8 animate-pulse">
        <p className="label-mono text-[var(--text-secondary)]">Buscando puente cultural...</p>
      </section>
    );
  }

  if (!pair?.suggestion?.title) {
    return null;
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
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="w-16 h-24 overflow-hidden shrink-0 bg-[var(--bg-chip)] cover-spine">
            <CoverImage
              src={source.coverUrl}
              title={source.title}
              creator={source.creator}
              type={source.type}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="label-mono text-[var(--text-secondary)] mb-1">
              Porque {source.type === 'book' ? 'leíste' : 'viste'}
            </p>
            <p className="font-heading text-lg leading-snug truncate">{source.title}</p>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 gap-1 px-2">
          <span className="label-mono text-[var(--text-secondary)] text-[0.65rem]">
            {affinity || 'afinidad temática'}
          </span>
          <span className="text-xl text-[var(--text-secondary)]" aria-hidden="true">
            →
          </span>
        </div>

        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="w-16 h-24 overflow-hidden shrink-0 bg-[var(--bg-chip)] cover-spine">
            <CoverImage
              src={suggestion.coverUrl}
              title={suggestion.title || 'Sugerencia'}
              creator={suggestion.creator || ''}
              type={targetType}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-mono text-[var(--text-secondary)] mb-1">
              Te sugerimos {targetType === 'book' ? 'leer' : 'ver'}
            </p>
            <p className="font-heading text-lg leading-snug truncate">{suggestion.title}</p>
            {suggestion.creator ? (
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 truncate">
                {suggestion.creator}
              </p>
            ) : null}
          </div>
        </div>

        {suggestion.id && (
          <Link to={workPath(targetType, suggestion.id)} className="btn-solid shrink-0 self-stretch lg:self-center">
            Ver recomendación
          </Link>
        )}
      </div>
    </section>
  );
}
