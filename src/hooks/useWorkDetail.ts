import { useEffect, useState } from 'react';
import { getMovieDetails } from '../services/tmdb';
import { getBookDetails } from '../services/openLibrary';

export function useWorkDetail(tipo?: string, id?: string) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tipo || !id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchDetail = async () => {
      try {
        const data =
          tipo === 'pelicula' ? await getMovieDetails(id) : await getBookDetails(id);

        if (!cancelled) {
          setDetail((data as Record<string, unknown>) || null);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el detalle');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [tipo, id]);

  return { detail, loading, error };
}
