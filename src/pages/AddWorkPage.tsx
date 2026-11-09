import { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import type { Work, WorkType, WorkStatus, SearchResult } from '../types';
import TypeToggle from '../components/forms/TypeToggle';
import StarRating from '../components/forms/StarRating';
import ErrorSummary from '../components/forms/ErrorSummary';
import Toast from '../components/feedback/Toast';
import CoverImage from '../components/works/CoverImage';
import { searchMovies } from '../services/tmdb';
import { searchBooks } from '../services/openLibrary';
import { useDebounce } from '../hooks/useDebounce';

export default function AddWorkPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addWork } = useLibrary();

  const initialData = (location.state as { prefill?: SearchResult } | null)?.prefill;

  const [type, setType] = useState<WorkType>(initialData?.type || 'book');
  const [query, setQuery] = useState(initialData?.title || '');
  const [selectedWork, setSelectedWork] = useState<SearchResult | null>(initialData || null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState<WorkStatus>('done');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (selectedWork && query === selectedWork.title) {
      return;
    }

    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const res = type === 'book' ? await searchBooks(debouncedQuery) : await searchMovies(debouncedQuery);
      setResults(res.slice(0, 5));
      setActiveIndex(-1);
    };
    fetchResults();
  }, [debouncedQuery, type, selectedWork, query]);

  const pickResult = (res: SearchResult) => {
    setSelectedWork(res);
    setQuery(res.title);
    setResults([]);
    setActiveIndex(-1);
  };

  const handleResultKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0 || selectedWork) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pickResult(results[activeIndex]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!selectedWork) {
      newErrors.push('Debes seleccionar una obra válida de la lista.');
    }

    if (status === 'done' && rating === 0) {
      newErrors.push('Debes calificar la obra si ya la consumiste.');
    }

    setErrors(newErrors);

    if (newErrors.length > 0) {
      return;
    }

    setIsSaving(true);
    const noteText = notes.trim();
    const newWork: Work = {
      id: selectedWork!.id,
      type: selectedWork!.type,
      title: selectedWork!.title,
      creator: selectedWork!.creator,
      year: selectedWork!.year,
      coverUrl: selectedWork!.coverUrl,
      status,
      rating: status === 'done' ? rating : undefined,
      notes: noteText
        ? spoiler
          ? `[Spoiler] ${noteText}`
          : noteText
        : undefined,
      genres: selectedWork!.genres?.length ? selectedWork!.genres : [],
      addedAt: Date.now(),
    };

    addWork(newWork);
    setShowToast(true);
    const next = status === 'pending' ? '/listas' : '/perfil';
    setTimeout(() => navigate(next), 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="label-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        ← Volver
      </button>

      <p className="label-mono text-center text-[var(--text-secondary)] mt-8 mb-2">
        Comparte tu opinión
      </p>
      <h1 className="font-heading text-3xl sm:text-4xl text-center mb-3">
        {selectedWork ? `Escribir reseña · ${selectedWork.title}` : 'Añadir obra'}
      </h1>
      <p className="text-center text-sm text-[var(--text-secondary)] font-mono mb-10">
        Tu experiencia puede ayudar a otros a elegir su próxima lectura o película.
      </p>

      <ErrorSummary errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <fieldset>
          <legend className="label-mono text-[var(--text-secondary)] mb-3">Tipo de obra</legend>
          <TypeToggle
            value={type}
            onChange={(t) => {
              setType(t);
              setSelectedWork(null);
              setQuery('');
              setResults([]);
            }}
          />
        </fieldset>

        <div className="relative">
          <label htmlFor="title-search" className="label-mono block mb-2">
            Título (obligatorio)
          </label>
          <input
            id="title-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedWork(null);
            }}
            onKeyDown={handleResultKeyDown}
            placeholder={`Buscar ${type === 'book' ? 'libro' : 'película'}...`}
            className="w-full h-12 px-0 bg-transparent border-b border-[var(--border-color)] focus:border-[var(--text-primary)] outline-none"
            autoComplete="off"
          />
          {selectedWork && (
            <p className="mt-2 text-xs text-[var(--text-secondary)] font-mono">
              Seleccionado: {selectedWork.title} · {selectedWork.creator}
            </p>
          )}
          {results.length > 0 && !selectedWork && (
            <ul className="absolute top-full mt-1 w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] z-10 max-h-60 overflow-y-auto">
              {results.map((res, index) => (
                <li
                  key={res.id}
                  onClick={() => pickResult(res)}
                  className={`p-3 flex gap-3 cursor-pointer border-b border-[var(--border-color)] last:border-0 ${
                    index === activeIndex ? 'bg-[var(--bg-chip)]' : 'hover:bg-[var(--bg-chip)]'
                  }`}
                >
                  <div className="w-10 h-14 overflow-hidden shrink-0 bg-[var(--bg-chip)]">
                    <CoverImage
                      src={res.coverUrl}
                      title={res.title}
                      creator={res.creator}
                      type={res.type}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-sm">{res.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {res.creator} · {res.year}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <fieldset>
          <legend className="label-mono mb-3">Estado</legend>
          <div className="flex flex-wrap gap-4 text-sm font-mono">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={status === 'done'} onChange={() => setStatus('done')} />
              {type === 'book' ? 'Leído' : 'Visto'}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={status === 'pending'} onChange={() => setStatus('pending')} />
              {type === 'book' ? 'Por leer' : 'Por ver'}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={status === 'dnf'} onChange={() => setStatus('dnf')} />
              Lo dejé (DNF)
            </label>
          </div>
        </fieldset>

        {status === 'done' && (
          <div>
            <p className="label-mono mb-3">Calificación (obligatoria)</p>
            <StarRating value={rating} onChange={setRating} size={28} step={0.5} />
          </div>
        )}

        <div>
          <label htmlFor="notes" className="label-mono block mb-2">
            Tu reseña (opcional)
          </label>
          <textarea
            id="notes"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] resize-y font-mono text-sm"
            placeholder="Cuéntanos qué te pareció..."
          />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
              />
              Esta reseña contiene spoilers
            </label>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              {notes.trim().length} caracteres
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)] flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="btn-solid disabled:opacity-50">
            {isSaving ? 'Guardando...' : 'Publicar reseña'}
          </button>
        </div>
      </form>

      {showToast && (
        <Toast
          message={`✓ ${selectedWork?.title} se guardó en tu biblioteca`}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
