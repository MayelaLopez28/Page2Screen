import StarRating from '../forms/StarRating';

interface Opinion {
  id: string;
  author: string;
  rating: number;
  text?: string;
}

export default function OpinionList({ opinions }: { opinions: Opinion[] }) {
  if (opinions.length === 0) {
    return (
      <div className="border-y border-[var(--border-color)] py-8 px-4 sm:px-6">
        <p className="label-mono text-[var(--text-secondary)]">
          Aún no hay opiniones de tu círculo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 border-y border-[var(--border-color)]">
      {opinions.map((op) => (
        <article
          key={op.id}
          className="py-6 border-b border-[var(--border-color)] last:border-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center font-heading text-sm">
              {op.author.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-heading text-sm">{op.author}</p>
              {op.rating > 0 ? <StarRating value={op.rating} readonly size={14} /> : null}
            </div>
          </div>
          {op.text ? (
            <p className="text-sm font-mono text-[var(--text-primary)] leading-relaxed mt-2">
              {op.text}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
