import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in">
      <h1 className="text-8xl font-heading font-bold text-[var(--text-primary)] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[var(--text-secondary)] mb-8">Página no encontrada</h2>
      <Link
        to="/"
        className="px-8 py-3 bg-[var(--accent)] text-white font-bold text-sm rounded-full hover:brightness-110 shadow-[0_8px_24px_rgba(192,38,211,0.35)]"
      >
        Volver a Explorar
      </Link>
    </div>
  );
}
