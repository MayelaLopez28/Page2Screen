export type WorkType = 'book' | 'movie';
export type WorkStatus = 'done' | 'pending' | 'dnf';

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  creator: string;
  year: string;
  coverUrl?: string;
  /** Portadas alternativas si la principal falla (p. ej. Open Library). */
  coverFallbacks?: string[];
  genres: string[];
  status: WorkStatus;
  rating?: number;
  notes?: string;
  consumedCount?: number;
  consumptionDates?: number[];
  addedAt: number;
}

export interface Friend {
  id: string;
  name: string;
  handle?: string;
  avatar?: string;
  recentWorks: Work[];
  activity?: string;
  activityAt?: string;
}

export interface SearchResult {
  id: string;
  type: WorkType;
  title: string;
  creator: string;
  year: string;
  coverUrl?: string;
  coverFallbacks?: string[];
  genres?: string[];
}
