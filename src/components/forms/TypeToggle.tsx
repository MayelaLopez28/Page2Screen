import type { WorkType } from '../../types';

interface TypeToggleProps {
  value: WorkType;
  onChange: (type: WorkType) => void;
}

export default function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de obra">
      <button
        type="button"
        role="radio"
        aria-checked={value === 'book'}
        onClick={() => onChange('book')}
        className={value === 'book' ? 'pill pill-active' : 'pill'}
      >
        Libro
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'movie'}
        onClick={() => onChange('movie')}
        className={value === 'movie' ? 'pill pill-active' : 'pill'}
      >
        Película
      </button>
    </div>
  );
}
