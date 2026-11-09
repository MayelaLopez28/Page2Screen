import { useEffect, useState } from 'react';
import type { Work } from '../types';
import {
  getCrossRecommendation,
  type CrossRecommendation,
} from '../services/recommender';
import { useLibrary } from '../context/LibraryContext';

export function useRecommendation(sourceWork: Work | null) {
  const { works } = useLibrary();
  const [recommendation, setRecommendation] = useState<CrossRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sourceWork) {
      setRecommendation(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getCrossRecommendation(
      sourceWork,
      works.map((w) => w.id),
    )
      .then((rec) => {
        if (!cancelled) {
          setRecommendation(rec);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceWork, works]);

  return { recommendation, suggestion: recommendation?.suggestion ?? null, loading };
}
