import { Link } from 'react-router-dom';
import type { Work, WorkType } from '../../types';
import CoverImage from '../works/CoverImage';
import { workPath } from '../../utils/routes';

interface SimilarWorksProps {
  sourceTitle: string;
  type: WorkType;
  items: Work[];
  loading?: boolean;
}

export default function SimilarWorks({ sourceTitle, type, items, loading }: SimilarWorksProps) {
  if (loading) {
    return (
      <section className="py-7 sm:py-9 border-b border-[var(--border-color)]" aria-busy="true">
        <p className="label-mono text-[var(--text-secondary)] animate-pulse">
          Buscando {type === 'book' ? 'libros' : 'películas'} similares...
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-7 sm:py-9 border-b border-[var(--border-color)]"
      aria-labelledby="similar-heading"
    >
      <h2 id="similar-heading" className="font-heading text-2xl sm:text-3xl mb-2">
        {type === 'book' ? 'Otros libros' : 'Otras películas'} del mismo género
      </h2>
      <p className="text-sm font-mono text-[var(--text-secondary)] mb-6">
        Porque estás viendo «{sourceTitle}»
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        {items.map((work) => (
          <li key={work.id}>
            <Link to={workPath(work.type, work.id)} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-[var(--bg-chip)] cover-spine mb-3">
                <CoverImage
                  src={work.coverUrl}
                  title={work.title}
                  creator={work.creator}
                  type={work.type}
                  alt={`Portada de ${work.title}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <p className="font-heading text-sm sm:text-base leading-snug line-clamp-2">
                {work.title}
              </p>
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-1 truncate">
                {work.creator}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
