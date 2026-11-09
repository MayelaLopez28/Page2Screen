import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Work } from '../../types';
import CoverImage from './CoverImage';
import { workPath } from '../../utils/routes';

interface WorkCardProps {
  work: Work;
  showRating?: boolean;
  compact?: boolean;
}

function formatRating(value: number) {
  return Number.isInteger(value) ? value.toFixed(1) : value.toFixed(1);
}

export default function WorkCard({ work, showRating = true }: WorkCardProps) {
  const isBook = work.type === 'book';
  const typeLabel = isBook ? 'LIBRO' : 'PELÍCULA';
  const genreLabel = work.genres?.[0]?.replace(/_/g, ' ') || typeLabel;

  return (
    <article className="flex flex-col gap-3">
      <Link
        to={workPath(work.type, work.id)}
        className="group block focus-visible:ring-2 rounded-sm"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-chip)] cover-spine">
          <CoverImage
            src={work.coverUrl}
            title={work.title}
            creator={work.creator}
            type={work.type}
            alt={`Portada de ${work.title}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </Link>

      <div className="px-0.5 flex flex-col gap-1.5">
        <Link to={workPath(work.type, work.id)} className="hover:opacity-80">
          <h3 className="font-heading text-lg leading-snug text-[var(--text-primary)] line-clamp-2">
            {work.title}
          </h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{work.creator}</p>

        {showRating && work.rating ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-0.5 text-[var(--text-primary)]">
              {Array.from({ length: 5 }).map((_, i) => {
                const fill = Math.max(0, Math.min(1, (work.rating || 0) - i));
                return (
                  <span key={i} className="relative inline-flex">
                    <Star size={13} className="text-[var(--border-color)]" fill="transparent" />
                    <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                      <Star size={13} fill="currentColor" />
                    </span>
                  </span>
                );
              })}
            </div>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {formatRating(work.rating)}
            </span>
          </div>
        ) : null}

        <span className="mt-1 inline-flex self-start px-2.5 py-1 rounded-full border border-[var(--border-color)] label-mono text-[var(--text-secondary)]">
          {genreLabel}
        </span>
      </div>
    </article>
  );
}
