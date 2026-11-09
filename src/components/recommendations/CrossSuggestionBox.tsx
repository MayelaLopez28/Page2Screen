import { Link } from 'react-router-dom';
import type { Work } from '../../types';
import type { CrossRecommendation } from '../../services/recommender';
import { workPath } from '../../utils/routes';
import CoverImage from '../works/CoverImage';

interface CrossSuggestionBoxProps {
  recommendation: CrossRecommendation;
  onQuickAdd?: (work: Partial<Work>) => void;
  alreadyInList?: boolean;
}

export default function CrossSuggestionBox({
  recommendation,
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
      className="bg-[var(--bg-surface)] border-l-4 border-[var(--text-primary)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
      aria-label="Sugerencia cruzada"
    >
      {suggestion.coverUrl ? (
        <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0 bg-[var(--bg-chip)] overflow-hidden">
          <CoverImage
            src={suggestion.coverUrl}
            title={suggestion.title}
            creator={suggestion.creator || ''}
            type={suggestion.type}
            alt={`Portada de ${suggestion.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 shrink-0 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-app)] flex items-center justify-center font-mono text-sm">
          ⇄
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="label-mono text-[var(--text-secondary)] mb-2">
          Sugerencia cruzada basada en esta obra
        </p>
        <p className="font-heading text-lg sm:text-xl leading-tight">
          {isBook ? 'Libro' : 'Película'} «{suggestion.title}»
        </p>
        {suggestion.creator ? (
          <p className="text-sm font-mono text-[var(--text-primary)] mt-1">
            de {suggestion.creator}
          </p>
        ) : null}
        <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
          {affinity} · {reason}
        </p>
      </div>
      <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
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
