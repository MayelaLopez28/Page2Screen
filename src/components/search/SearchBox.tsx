import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchMovies } from '../../services/tmdb';
import { searchBooks } from '../../services/openLibrary';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchResult } from '../../types';
import { workPath } from '../../utils/routes';
import SearchResultItem from './SearchResultItem';

interface SearchBoxProps {
  variant?: 'default' | 'hero';
}

export function SearchBox({ variant = 'default' }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 400);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;

      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [movies, books] = await Promise.all([
          searchMovies(debouncedQuery),
          searchBooks(debouncedQuery),
        ]);

        if (cancelled) {
          return;
        }

        setResults([...movies.slice(0, 4), ...books.slice(0, 4)]);
        setIsOpen(true);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    navigate(workPath(item.type, item.id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (!isOpen || results.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedIndex >= 0) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const showDropdown = isOpen && (loading || results.length > 0 || debouncedQuery.trim().length > 0);
  const activeId = selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined;

  return (
    <div className="relative w-full" ref={containerRef}>
      <label htmlFor="global-search" className="sr-only">
        Buscar libro o película
      </label>
      <div className="relative flex items-center">
        <input
          id="global-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar título o autor"
          className={
            variant === 'hero'
              ? 'w-full h-12 pl-3 pr-10 bg-transparent border-b border-[var(--text-primary)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none'
              : 'w-full h-9 pl-0 pr-8 bg-transparent border-b border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-primary)]'
          }
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={activeId}
        />
        {loading ? (
          <Loader2
            className="absolute right-0 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-secondary)]"
            size={16}
            aria-hidden="true"
          />
        ) : (
          <Search
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            size={16}
            aria-hidden="true"
          />
        )}
      </div>

      {showDropdown && (
        <ul
          id="search-results"
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] shadow-lg"
        >
          {loading && results.length === 0 && (
            <li className="p-4 text-sm text-[var(--text-secondary)]" role="presentation">
              Buscando…
            </li>
          )}
          {!loading && results.length === 0 && debouncedQuery.trim() && (
            <li className="p-4 text-sm text-[var(--text-secondary)]" role="presentation">
              No hay coincidencias. Elige una obra de las APIs.
            </li>
          )}
          {results.map((item, index) => (
            <SearchResultItem
              key={item.id}
              id={`search-option-${index}`}
              item={item}
              active={index === selectedIndex}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
