import { Link } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import type { Work } from '../../types';
import CoverImage from '../works/CoverImage';
import { formatYear } from '../../utils/format';
import { workPath } from '../../utils/routes';

interface RecommendationCardProps {
  work: Work;
  reason: string;
}

export default function RecommendationCard({ work, reason }: RecommendationCardProps) {
  return (
    <article className="flex flex-col h-full border border-[var(--border-color)] bg-[var(--bg-surface)]">
      <Link to={workPath(work.type, work.id)} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-chip)] cover-spine">
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

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={workPath(work.type, work.id)}>
          <h3 className="font-heading text-xl leading-snug">{work.title}</h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)]">
          {work.creator} · {formatYear(work.year)}
        </p>
        {work.rating ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
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
              {Number(work.rating).toFixed(1)}
            </span>
          </div>
        ) : null}

        <div className="mt-auto pt-3 border-t border-[var(--border-color)] flex gap-2 items-start">
          <Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">{reason}</p>
        </div>
      </div>
    </article>
  );
}
