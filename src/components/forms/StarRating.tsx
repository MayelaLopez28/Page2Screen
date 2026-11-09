import { useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  ariaLabel?: string;
  step?: 0.5 | 1;
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function formatRating(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 24,
  ariaLabel = 'Calificación',
  step = 0.5,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (readonly || !onChange) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, roundToStep(value + step, step)));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(step, roundToStep(value - step, step)));
    }
  };

  const valueFromPointer = (star: number, event: MouseEvent<HTMLButtonElement>) => {
    if (step === 1) {
      return star;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const isHalf = event.clientX - rect.left < rect.width / 2;
    return isHalf ? star - 0.5 : star;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          'flex items-center gap-0.5',
          !readonly && 'focus-within:ring-2 focus-within:ring-offset-2 rounded-sm',
        )}
        role={readonly ? 'img' : 'slider'}
        aria-label={readonly ? `${formatRating(value)} de 5 estrellas` : ariaLabel}
        aria-valuemin={readonly ? undefined : step}
        aria-valuemax={readonly ? undefined : 5}
        aria-valuenow={readonly ? undefined : value}
        aria-valuetext={readonly ? undefined : `${formatRating(value)} de 5`}
        tabIndex={readonly ? undefined : 0}
        onKeyDown={handleKeyDown}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fillRatio = Math.max(0, Math.min(1, displayValue - (star - 1)));
          const fillPercent = `${fillRatio * 100}%`;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              aria-label={`${formatRating(star)} estrellas`}
              onClick={(e) => {
                if (readonly || !onChange) {
                  return;
                }

                onChange(valueFromPointer(star, e));
              }}
              onMouseMove={(e) => {
                if (readonly) return;
                setHoverValue(valueFromPointer(star, e));
              }}
              onMouseLeave={() => !readonly && setHoverValue(0)}
              className={clsx(
                'relative focus:outline-none transition-transform active:scale-90 motion-reduce:transition-none',
                readonly ? 'cursor-default p-0.5' : 'cursor-pointer p-2 border border-[var(--border-color)] bg-[var(--bg-surface)]',
              )}
            >
              <Star size={size} className="text-[var(--border-color)]" fill="transparent" />
              <span
                className="absolute inset-0.5 overflow-hidden text-[var(--color-star)]"
                style={{ width: fillPercent }}
                aria-hidden="true"
              >
                <Star size={size} fill="currentColor" className="text-[var(--color-star)]" />
              </span>
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <span className="text-sm font-semibold text-[var(--text-secondary)] tabular-nums">
          {formatRating(value)}
        </span>
      )}
    </div>
  );
}
