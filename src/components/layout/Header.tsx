import { Link, useLocation } from 'react-router-dom';
import { SearchBox } from '../search/SearchBox';

export default function Header() {
  const { pathname } = useLocation();

  const navClass = (active: boolean) =>
    `label-mono transition-opacity ${
      active ? 'opacity-100 underline underline-offset-4' : 'opacity-60 hover:opacity-100'
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

          <div className="flex-1 max-w-md">
            <p className="label-mono text-[var(--text-secondary)] mb-1">Buscar</p>
            <SearchBox variant="default" />
          </div>
        </div>

        <nav className="flex items-center gap-4 sm:gap-5 shrink-0" aria-label="Navegación principal">
          <Link
            to="/"
            className={navClass(pathname === '/')}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Catálogo
          </Link>
          <Link
            to="/listas"
            className={navClass(pathname === '/listas')}
            aria-current={pathname === '/listas' ? 'page' : undefined}
          >
            Mis reseñas
          </Link>
          <Link to="/perfil" className="btn-outline">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
