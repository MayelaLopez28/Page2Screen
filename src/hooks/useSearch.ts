import { useState, useEffect } from 'react';
import type { SearchResult } from '../types';
import { searchMovies } from '../services/tmdb';
import { searchBooks } from '../services/openLibrary';

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let isMounted = true;
    setLoading(true);

    Promise.all([searchMovies(query), searchBooks(query)])
      .then(([movies, books]) => {
        if (isMounted) {
          setResults([...movies.slice(0, 4), ...books.slice(0, 4)]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return { results, loading };
}
