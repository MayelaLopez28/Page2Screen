import type { WorkType } from '../../types';

interface CoverFallbackProps {
  title: string;
  creator: string;
  type: WorkType;
}

export default function CoverFallback({ title, creator }: CoverFallbackProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[var(--bg-chip)] text-[var(--text-secondary)]"
      aria-hidden="true"
    >
      <p className="label-mono mb-4">Portada</p>
      <h3 className="font-heading text-base leading-tight mb-2 break-words text-[var(--text-primary)] line-clamp-3">
        {title}
      </h3>
      <p className="text-xs font-mono mt-auto opacity-80">{creator}</p>
    </div>
  );
}
