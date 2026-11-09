import type { Work } from '../types';

export function generateProfileCode(name: string, works: Work[]): string {
  const sorted = [...works].sort((a, b) => b.addedAt - a.addedAt);
  const recentWorks = sorted.slice(0, 30).map((w) => ({
    id: w.id,
    t: w.title,
    r: w.rating || 0,
    c: w.coverUrl || '',
    y: w.year || '',
    cr: w.creator || '',
  }));
  const payload = { n: name, w: recentWorks };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeProfileCode(code: string) {
  try {
    const payload = JSON.parse(decodeURIComponent(atob(code)));

    if (!payload.n || !Array.isArray(payload.w)) {
      throw new Error('Código inválido');
    }

    return payload as {
      n: string;
      w: Array<{ id: string; t: string; r: number; c?: string; y?: string; cr?: string }>;
    };
  } catch {
    return null;
  }
}
