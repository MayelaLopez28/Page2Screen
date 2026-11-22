import { useEffect, useRef, useState } from 'react';
import type { Work } from '../types';
import { getSimilarByGenre } from '../services/recommender';
import { useLibrary } from '../context/LibraryContext';

function similarKey(work: Work | null) {
  if (!work) return '';
  return `${work.id}::${work.type}::${(work.genres || []).slice(0, 3).join('|')}`;
}

export function useSimilarWorks(sourceWork: Work | null, limit = 4) {
  const { works } = useLibrary();
  const [items, setItems] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const lockedKey = useRef('');
  const libraryIdsRef = useRef(works.map((w) => w.id));
  libraryIdsRef.current = works.map((w) => w.id);

  const key = similarKey(sourceWork);

  useEffect(() => {
    if (!sourceWork || !key) {
      lockedKey.current = '';
      setItems([]);
      return;
    }

    if (lockedKey.current === key) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSimilarByGenre(sourceWork, libraryIdsRef.current, limit)
      .then((list) => {
        if (cancelled) return;
        lockedKey.current = key;
        setItems(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, sourceWork, limit]);

  return { items, loading };
}
