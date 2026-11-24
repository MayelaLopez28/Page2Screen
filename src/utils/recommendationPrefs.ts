import { getItem, setItem } from './storage';

const DISMISSED_KEY = 'p2s_dismissed_recs_v1';
const ROTATION_KEY = 'p2s_rec_rotation_v1';
const PAUSE_KEY = 'p2s_rec_pause_v1';

/** Tras 3 rechazos seguidos, pausa recomendaciones (2 h). */
export const REC_DISMISS_STREAK_LIMIT = 3;
export const REC_PAUSE_MS = 2 * 60 * 60 * 1000;

type IdMap = Record<string, string[]>;
type RotationMap = Record<string, number>;
type PauseState = {
  streak: number;
  pauseUntil: number | null;
};
type PauseMap = Record<string, PauseState>;

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

function getPauseState(userId: string): PauseState {
  const map = getItem<PauseMap>(PAUSE_KEY, {});
  return map[userId] || { streak: 0, pauseUntil: null };
}

function setPauseState(userId: string, state: PauseState) {
  const map = getItem<PauseMap>(PAUSE_KEY, {});
  map[userId] = state;
  setItem(PAUSE_KEY, map);
}

/** true si las recomendaciones cruzadas están en pausa por rechazos. */
export function isRecPaused(userId: string): { paused: boolean; pauseUntil: number | null } {
  if (!userId) return { paused: false, pauseUntil: null };
  const state = getPauseState(userId);
  if (!state.pauseUntil) return { paused: false, pauseUntil: null };
  if (Date.now() >= state.pauseUntil) {
    setPauseState(userId, { streak: 0, pauseUntil: null });
    return { paused: false, pauseUntil: null };
  }
  return { paused: true, pauseUntil: state.pauseUntil };
}

/**
 * Registra un “No me interesa”.
 * Tras 3 seguidos → pausa REC_PAUSE_MS.
 */
export function recordRecDismiss(userId: string): {
  streak: number;
  paused: boolean;
  pauseUntil: number | null;
} {
  if (!userId) return { streak: 0, paused: false, pauseUntil: null };

  const current = isRecPaused(userId);
  if (current.paused) {
    return { streak: REC_DISMISS_STREAK_LIMIT, paused: true, pauseUntil: current.pauseUntil };
  }

  const prev = getPauseState(userId);
  const streak = (prev.streak || 0) + 1;

  if (streak >= REC_DISMISS_STREAK_LIMIT) {
    const pauseUntil = Date.now() + REC_PAUSE_MS;
    setPauseState(userId, { streak: 0, pauseUntil });
    return { streak: REC_DISMISS_STREAK_LIMIT, paused: true, pauseUntil };
  }

  setPauseState(userId, { streak, pauseUntil: null });
  return { streak, paused: false, pauseUntil: null };
}

/** Si el usuario acepta ver/guardar una sugerencia, reinicia la racha de rechazos. */
export function resetRecDismissStreak(userId: string) {
  if (!userId) return;
  const { paused } = isRecPaused(userId);
  if (paused) return;
  setPauseState(userId, { streak: 0, pauseUntil: null });
}

export function formatPauseRemaining(pauseUntil: number): string {
  const ms = Math.max(0, pauseUntil - Date.now());
  const mins = Math.ceil(ms / 60000);
  if (mins >= 120) {
    const h = Math.floor(mins / 60);
    return `${h} h`;
  }
  if (mins <= 1) return 'unos minutos';
  return `${mins} min`;
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
