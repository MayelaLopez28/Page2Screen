import { useEffect, useRef, useState } from 'react';
import type { Work } from '../types';
import {
  getCrossRecommendation,
  type CrossRecommendation,
} from '../services/recommender';
import { useLibrary } from '../context/LibraryContext';

/** Clave estable: no reconsultar al cambiar la biblioteca (evita saltos de sugerencia). */
function recommendationKey(work: Work | null) {
  if (!work) return '';
  const genres = (work.genres || []).slice(0, 4).join('|');
  return `${work.id}::${work.type}::${genres}`;
}

export function useRecommendation(sourceWork: Work | null) {
  const { works } = useLibrary();
  const [recommendation, setRecommendation] = useState<CrossRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const lockedKey = useRef('');
  const libraryIdsRef = useRef(works.map((w) => w.id));
  libraryIdsRef.current = works.map((w) => w.id);

  const key = recommendationKey(sourceWork);

  useEffect(() => {
    if (!sourceWork || !key) {
      lockedKey.current = '';
      setRecommendation(null);
      return;
    }

    // Ya tenemos sugerencia para esta obra: no volver a pedir (no cambia “de golpe”).
    if (lockedKey.current === key) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getCrossRecommendation(sourceWork, libraryIdsRef.current)
      .then((rec) => {
        if (cancelled) return;
        lockedKey.current = key;
        setRecommendation(rec);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, sourceWork]);

  return { recommendation, suggestion: recommendation?.suggestion ?? null, loading };
}
