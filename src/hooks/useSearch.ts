import { useState, useEffect } from 'react';
import type { SearchResult } from '../types';
import { searchMovies } from '../services/tmdb';
import { searchBooks } from '../services/openLibrary';

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([searchMovies(query), searchBooks(query)])
      .then(([movies, books]) => {
        if (isMounted) {
          setResults([...movies.slice(0, 4), ...books.slice(0, 4)]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResults([]);
          setError('No se pudo completar la búsqueda. Intenta de nuevo.');
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

  return { results, loading, error };
}
