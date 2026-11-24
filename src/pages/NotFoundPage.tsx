import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in gap-6">
      <h1 className="text-8xl font-heading font-bold text-[var(--text-primary)]">404</h1>
      <h2 className="text-2xl font-heading text-[var(--text-secondary)]">Página no encontrada</h2>
      <Link to="/" className="btn-outline min-h-11 px-5">
        ← Volver
      </Link>
    </div>
  );
}
