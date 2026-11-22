import { getItem, setItem } from './storage';

const DISMISSED_KEY = 'p2s_dismissed_recs_v1';
const ROTATION_KEY = 'p2s_rec_rotation_v1';

type IdMap = Record<string, string[]>;
type RotationMap = Record<string, number>;

export function getDismissedRecIds(userId: string): string[] {
  const map = getItem<IdMap>(DISMISSED_KEY, {});
  return map[userId] || [];
}

export function dismissRecId(userId: string, suggestionId: string) {
  if (!userId || !suggestionId) return;
  const map = getItem<IdMap>(DISMISSED_KEY, {});
  const prev = map[userId] || [];
  if (prev.includes(suggestionId)) return;
  map[userId] = [...prev, suggestionId].slice(-40);
  setItem(DISMISSED_KEY, map);
}

export function getRecSession(userId: string): number {
  const map = getItem<RotationMap>(ROTATION_KEY, {});
  return map[userId] || 0;
}

/** Cada login avanza el contador → otra recomendación. */
export function bumpRecSession(userId: string): number {
  if (!userId) return 0;
  const map = getItem<RotationMap>(ROTATION_KEY, {});
  const next = (map[userId] || 0) + 1;
  map[userId] = next;
  setItem(ROTATION_KEY, map);
  return next;
}
