import { Link } from 'react-router-dom';
import type { Work } from '../../types';
import type { CrossRecommendation } from '../../services/recommender';
import { workPath } from '../../utils/routes';
import CoverImage from '../works/CoverImage';

interface CrossSuggestionBoxProps {
  recommendation: CrossRecommendation;
  source: Pick<Work, 'title' | 'coverUrl' | 'type' | 'creator'>;
  onQuickAdd?: (work: Partial<Work>) => void;
  alreadyInList?: boolean;
}

export default function CrossSuggestionBox({
  recommendation,
  source,
  onQuickAdd,
  alreadyInList,
}: CrossSuggestionBoxProps) {
  const { suggestion, affinity, reason } = recommendation;

  if (!suggestion.title || !suggestion.type) {
    return null;
  }

  const isBook = suggestion.type === 'book';

  return (
    <aside
      className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 sm:p-5"
      aria-label="Sugerencia cruzada"
    >
      <p className="label-mono text-[var(--text-secondary)] mb-4">
        Sugerencia cruzada · {affinity || 'género'}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-14 h-20 shrink-0 bg-[var(--bg-chip)] overflow-hidden">
            <CoverImage
              src={source.coverUrl}
              title={source.title}
              creator={source.creator || ''}
              type={source.type}
              alt={`Referencia: ${source.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
              Referencia
            </p>
            <p className="font-heading text-base sm:text-lg leading-snug truncate">
              {source.title}
            </p>
          </div>
        </div>

        <span className="label-mono text-[var(--text-secondary)] text-center shrink-0" aria-hidden="true">
          →
        </span>

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-14 h-20 shrink-0 bg-[var(--bg-chip)] overflow-hidden">
            <CoverImage
              src={suggestion.coverUrl}
              title={suggestion.title}
              creator={suggestion.creator || ''}
              type={suggestion.type}
              alt={`Portada de ${suggestion.title}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
              Te recomendamos {isBook ? 'leer' : 'ver'}
            </p>
            <p className="font-heading text-base sm:text-lg leading-snug truncate">
              {suggestion.title}
            </p>
            {suggestion.creator ? (
              <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 truncate">
                de {suggestion.creator}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <p className="text-xs font-mono text-[var(--text-secondary)] mb-4">{reason}</p>

      <div className="flex flex-col sm:flex-row gap-2">
        {suggestion.id && (
          <Link
            to={workPath(suggestion.type, suggestion.id)}
            className="btn-outline min-h-11 px-4 justify-center"
          >
            Ver
          </Link>
        )}
        {!alreadyInList && onQuickAdd ? (
          <button
            type="button"
            className="btn-solid min-h-11 px-4 justify-center"
            onClick={() => onQuickAdd(suggestion)}
          >
            + Por {isBook ? 'leer' : 'ver'}
          </button>
        ) : alreadyInList ? (
          <span className="btn-outline min-h-11 px-4 justify-center opacity-60 pointer-events-none">
            En tu lista
          </span>
        ) : null}
      </div>
    </aside>
  );
}
