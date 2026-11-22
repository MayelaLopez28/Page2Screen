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
        className={clsx('flex items-center gap-1', !readonly && 'rounded-sm focus-within:ring-2 focus-within:ring-offset-2')}
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
                'relative inline-flex shrink-0 items-center justify-center p-0 border-0 bg-transparent focus:outline-none',
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95',
              )}
              style={{ width: size, height: size }}
            >
              {/* Contorno vacío */}
              <Star
                size={size}
                strokeWidth={1.5}
                className="absolute inset-0 text-[var(--border-color)]"
                fill="none"
                aria-hidden
              />
              {/* Relleno recortado (alineado al mismo tamaño; sin inset que desfase) */}
              <span
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: fillPercent }}
                aria-hidden
              >
                <Star
                  size={size}
                  strokeWidth={1.5}
                  className="text-[var(--color-star,#C4A035)]"
                  fill="currentColor"
                />
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
