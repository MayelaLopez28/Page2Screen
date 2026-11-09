import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';

export default function ListsPage() {
  const { works } = useLibrary();

  const toRead = works.filter((w) => w.status === 'pending' && w.type === 'book');
  const toWatch = works.filter((w) => w.status === 'pending' && w.type === 'movie');

  return (
    <div className="animate-in fade-in space-y-12 w-full">
      <header className="text-center mb-4">
        <p className="label-mono text-[var(--text-secondary)] mb-2">Tu biblioteca</p>
        <h1 className="font-heading text-4xl sm:text-5xl">Mis listas</h1>
      </header>

      <section aria-labelledby="por-leer" className="w-full">
        <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
          <h2 id="por-leer" className="font-heading text-2xl">
            Por leer
          </h2>
          <span className="label-mono text-[var(--text-secondary)]">{toRead.length} libros</span>
        </div>
        {toRead.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] font-mono text-sm py-12">
            Nada aquí todavía.{' '}
            <Link to="/" className="underline text-[var(--text-primary)]">
              Explora el catálogo
            </Link>
          </p>
        ) : (
          <div className="grid-works">
            {toRead.map((work) => (
              <WorkCard key={work.id} work={work} showRating={false} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="por-ver" className="w-full">
        <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
          <h2 id="por-ver" className="font-heading text-2xl">
            Por ver
          </h2>
          <span className="label-mono text-[var(--text-secondary)]">{toWatch.length} películas</span>
        </div>
        {toWatch.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] font-mono text-sm py-12">
            Nada aquí todavía.{' '}
            <Link to="/" className="underline text-[var(--text-primary)]">
              Explora el catálogo
            </Link>
          </p>
        ) : (
          <div className="grid-works">
            {toWatch.map((work) => (
              <WorkCard key={work.id} work={work} showRating={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
