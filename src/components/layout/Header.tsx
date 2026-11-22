import { Link, useLocation } from 'react-router-dom';
import { SearchBox } from '../search/SearchBox';
import { useLibrary } from '../../context/LibraryContext';

export default function Header() {
  const { pathname } = useLocation();
  const { isLoggedIn } = useLibrary();

  const navClass = (active: boolean) =>
    `label-mono transition-colors ${
      active
        ? 'text-[var(--text-primary)] underline underline-offset-4'
        : 'text-[#4f4f4f] hover:text-[var(--text-primary)]'
    }`;

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/95 backdrop-blur sticky top-0 z-50">
      <div className="page-shell py-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 flex-1 min-w-0">
          <Link to="/" className="shrink-0">
            <span className="font-heading italic text-2xl sm:text-3xl text-[var(--text-primary)]">
              Page<span className="not-italic font-bold">2</span>Screen
            </span>
          </Link>

          <div className="flex-1 max-w-md lg:max-w-xl xl:max-w-2xl">
            <p className="label-mono text-[var(--text-secondary)] mb-1">Buscar</p>
            <SearchBox variant="default" />
          </div>
        </div>

        <nav className="flex items-center gap-4 sm:gap-5 shrink-0 flex-wrap" aria-label="Navegación principal">
          <Link
            to="/"
            className={navClass(pathname === '/' || pathname === '/explorar')}
            aria-current={pathname === '/' || pathname === '/explorar' ? 'page' : undefined}
          >
            Catálogo
          </Link>
          <Link
            to="/listas"
            className={navClass(pathname === '/listas')}
            aria-current={pathname === '/listas' ? 'page' : undefined}
          >
            Mis listas
          </Link>
          {isLoggedIn ? (
            <Link
              to="/perfil"
              className={navClass(pathname === '/perfil')}
              aria-current={pathname === '/perfil' ? 'page' : undefined}
            >
              Perfil
            </Link>
          ) : (
            <Link to="/entrar" className="btn-outline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
