import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Film, List, Plus } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';
import CrossBridge from '../components/recommendations/CrossBridge';

interface HomePageProps {
  filter: 'done' | 'pending';
}

export default function HomePage({ filter }: HomePageProps) {
  const { works, profileName } = useLibrary();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredWorks = works.filter((w) => w.status === filter);
  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / itemsPerPage));
  const currentWorks = filteredWorks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const stats = {
    booksDone: works.filter((w) => w.type === 'book' && w.status === 'done').length,
    moviesDone: works.filter((w) => w.type === 'movie' && w.status === 'done').length,
    pending: works.filter((w) => w.status === 'pending').length,
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--text-primary)] mb-2">
            Tus obras, {profileName}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <BookOpen size={16} aria-hidden="true" /> {stats.booksDone} Leídos
            </span>
            <span className="flex items-center gap-1">
              <Film size={16} aria-hidden="true" /> {stats.moviesDone} Vistos
            </span>
            <span className="flex items-center gap-1">
              <List size={16} aria-hidden="true" /> {stats.pending} Pendientes
            </span>
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Estado de la biblioteca"
        className="flex items-center gap-4 mb-8 border-b border-[var(--border-color)]"
      >
        <Link
          to="/"
          role="tab"
          aria-selected={filter === 'done'}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            filter === 'done'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Leídos y Vistos ({stats.booksDone + stats.moviesDone})
        </Link>
        <Link
          to="/pendientes"
          role="tab"
          aria-selected={filter === 'pending'}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Por leer / Por ver ({stats.pending})
        </Link>
      </div>

      {works.length > 0 && <CrossBridge />}

      {filteredWorks.length === 0 ? (
        <div className="text-center py-20 px-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--bg-app)] rounded-full mb-6 border-2 border-dashed border-[var(--border-color)]">
            <Plus size={32} className="text-[var(--text-secondary)]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-3">
            {works.length === 0
              ? 'Tu biblioteca está vacía'
              : 'Aún no hay obras en esta lista'}
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            Crea el puente entre página y pantalla: añade tu primer libro o película y empieza a
            descubrir recomendaciones cruzadas.
          </p>
          <Link
            to="/anadir"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-full font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
          >
            Añadir primera obra
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {currentWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[var(--border-color)] rounded text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[var(--bg-surface)]"
              >
                Anterior
              </button>
              <span className="text-sm font-bold px-4">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[var(--border-color)] rounded text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[var(--bg-surface)]"
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
