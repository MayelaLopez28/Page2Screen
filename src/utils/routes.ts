import type { WorkType } from '../types';

export function workTypeToRoute(type: WorkType): 'pelicula' | 'libro' {
  return type === 'movie' ? 'pelicula' : 'libro';
}

export function workPath(type: WorkType, id: string): string {
  const cleanId = id.replace(/^(m_|b_isbn_|b_gb_|b_)/, '');
  return `/obra/${workTypeToRoute(type)}/${encodeURIComponent(cleanId)}`;
}
