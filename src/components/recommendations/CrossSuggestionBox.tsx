import { Link } from 'react-router-dom';
import type { Work } from '../../types';
import type { CrossRecommendation } from '../../services/recommender';
import { workPath } from '../../utils/routes';

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
      className="border border-[var(--border-color)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      aria-label="Sugerencia cruzada"
    >
      <div className="w-10 h-10 shrink-0 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-app)] flex items-center justify-center font-mono text-sm">
        ⇄
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading text-base sm:text-lg mb-1">
          Sugerencia cruzada basada en esta obra
        </p>
        <p className="text-sm font-mono text-[var(--text-primary)]">
          {isBook ? 'Libro' : 'Película'} «{suggestion.title}»
          {suggestion.creator ? `, de ${suggestion.creator}` : ''}
        </p>
        <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
          {affinity} · {reason}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {suggestion.id && (
          <Link to={workPath(suggestion.type, suggestion.id)} className="btn-outline">
            Ver
          </Link>
        )}
        {!alreadyInList && onQuickAdd ? (
          <button type="button" className="btn-solid" onClick={() => onQuickAdd(suggestion)}>
            + Por {isBook ? 'leer' : 'ver'}
          </button>
        ) : alreadyInList ? (
          <span className="btn-outline opacity-60 pointer-events-none">En tu lista</span>
        ) : null}
      </div>
    </aside>
  );
}
