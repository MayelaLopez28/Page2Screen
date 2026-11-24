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
  /** Si true, la reseña se muestra tapada hasta que el lector la revele. */
  spoiler?: boolean;
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

export type FriendRequest = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromHandle: string;
  at: number;
};

export type AppNotification = {
  id: string;
  type: 'friend_request' | 'friend_activity';
  title: string;
  body: string;
  at: number;
  read: boolean;
  /** Para solicitudes: id de la petición. */
  requestId?: string;
  fromUserId?: string;
};

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
