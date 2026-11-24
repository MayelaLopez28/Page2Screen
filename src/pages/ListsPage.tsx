import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';

export default function ListsPage() {
  const { works, isLoggedIn } = useLibrary();

  if (!isLoggedIn) {
    return (
      <div className="animate-in fade-in max-w-lg mx-auto py-16 text-center space-y-6">
        <p className="label-mono text-[var(--text-secondary)]">Tu biblioteca</p>
        <h1 className="font-heading text-3xl sm:text-4xl">Mis listas</h1>
        <p className="text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
          Para ver lo que tienes por leer o por ver necesitas una sesión activa. Entra con una
          cuenta o crea un perfil nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/entrar"
            state={{
              reason:
                'Para ver lo que tienes por leer o por ver necesitas iniciar sesión o crear una cuenta.',
              from: '/listas',
            }}
            className="btn-solid min-h-11 px-6 justify-center"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/entrar"
            state={{
              openNewSession: true,
              reason:
                'Para ver lo que tienes por leer o por ver necesitas iniciar sesión o crear una cuenta.',
              from: '/listas',
            }}
            className="btn-outline min-h-11 px-6 justify-center"
          >
            Crear perfil
          </Link>
        </div>
        <p className="text-xs font-mono text-[var(--text-secondary)] pt-4">
          También puedes{' '}
          <Link to="/" className="underline text-[var(--text-primary)]">
            explorar el catálogo
          </Link>{' '}
          sin iniciar sesión.
        </p>
      </div>
    );
  }

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
