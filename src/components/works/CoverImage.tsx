import { useState } from 'react';
import type { WorkType } from '../../types';
import CoverFallback from './CoverFallback';

interface CoverImageProps {
  src?: string;
  title: string;
  creator: string;
  type: WorkType;
  alt?: string;
  className?: string;
}

export default function CoverImage({
  src,
  title,
  creator,
  type,
  alt = '',
  className = 'w-full h-full object-cover',
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <CoverFallback title={title} creator={creator} type={type} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
