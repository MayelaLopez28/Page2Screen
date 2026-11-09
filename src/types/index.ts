export type WorkType = 'book' | 'movie';
export type WorkStatus = 'done' | 'pending' | 'dnf';

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  creator: string;
  year: string;
  coverUrl?: string;
  genres: string[];
  status: WorkStatus;
  rating?: number;
  notes?: string;
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
  genres?: string[];
}
