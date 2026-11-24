import { useEffect, useMemo, useState } from 'react';
import type { WorkType } from '../../types';
import CoverFallback from './CoverFallback';

interface CoverImageProps {
  src?: string;
  fallbacks?: string[];
  title: string;
  creator: string;
  type: WorkType;
  alt?: string;
  className?: string;
}

export default function CoverImage({
  src,
  fallbacks = [],
  title,
  creator,
  type,
  alt = '',
  className = 'w-full h-full object-cover',
}: CoverImageProps) {
  const candidates = useMemo(() => {
    const list = [src, ...fallbacks].filter((u): u is string => Boolean(u && u.trim()));
    return [...new Set(list)];
  }, [src, fallbacks]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join('|')]);

  const current = candidates[index];

  if (!current) {
    return <CoverFallback title={title} creator={creator} type={type} />;
  }

  return (
    <img
      key={current}
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((i) => (i + 1 < candidates.length ? i + 1 : candidates.length));
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        // Open Library / Google a veces responden 200 con un pixel vacío
        if (img.naturalWidth <= 2 || img.naturalHeight <= 2) {
          setIndex((i) => (i + 1 < candidates.length ? i + 1 : candidates.length));
        }
      }}
    />
  );
}
