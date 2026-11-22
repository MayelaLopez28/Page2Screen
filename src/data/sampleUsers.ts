import type { Friend, Work } from '../types';
import { mockWorks } from './mock';

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
  /** Contraseña en claro solo para demo local (sin backend). */
  password: string;
  bio: string;
  works: Work[];
  friends: Friend[];
  isSample?: boolean;
}

function pickWorks(...ids: string[]): Work[] {
  return ids
    .map((id, index) => {
      const base = mockWorks.find((w) => w.id === id);
      if (!base) return null;
      return {
        ...base,
        status: 'done' as const,
        rating: base.rating || 4 + (index % 2) * 0.5,
        addedAt: Date.now() - (index + 1) * 86_400_000,
      };
    })
    .filter(Boolean) as Work[];
}

function toFriend(account: UserAccount): Friend {
  return {
    id: account.id,
    name: account.name,
    handle: account.handle,
    recentWorks: account.works.slice(0, 3),
    activity: account.works[0]
      ? `${account.works[0].type === 'movie' ? 'Vio' : 'Terminó de leer'} ${account.works[0].title}`
      : 'Nuevo en Page2Screen',
    activityAt: 'hace 1 d',
  };
}

export const PRIMARY_USER_ID = 'u_mayela';

/** Contraseña compartida de las 3 cuentas demo (no se muestran en la UI). */
export const DEMO_PASSWORD = 'page2screen';

export const SAMPLE_ACCOUNTS: UserAccount[] = [
  {
    id: PRIMARY_USER_ID,
    name: 'Mayela Lopez',
    handle: 'mayelalopez',
    password: DEMO_PASSWORD,
    bio: 'Fundadora de Page2Screen. Cruza libros y cine sin parar.',
    works: pickWorks('b_isbn_9780441172719', 'm_157336', 'b_isbn_9780553293357', 'm_27205'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_andrea',
    name: 'Andrea Lopez',
    handle: 'andrealopez',
    password: DEMO_PASSWORD,
    bio: 'Romance contemporáneo y thrillers de domingo.',
    works: pickWorks('b_isbn_9780141439518', 'm_11', 'b_isbn_9780307743657', 'm_694'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_regina',
    name: 'Regina Sosa',
    handle: 'reginasosa',
    password: DEMO_PASSWORD,
    bio: 'Fantasía épica, relecturas y cine de autor.',
    works: pickWorks('b_isbn_9780547928227', 'm_27205', 'b_isbn_9780439023481', 'm_157336'),
    friends: [],
    isSample: true,
  },
];

export function getSampleSuggestions(currentUserId: string, currentFriends: Friend[]): UserAccount[] {
  const friendIds = new Set(currentFriends.map((f) => f.id));
  const friendHandles = new Set(
    currentFriends.map((f) => (f.handle || f.name).toLowerCase().replace(/\s+/g, '')),
  );

  return SAMPLE_ACCOUNTS.filter((account) => {
    if (account.id === currentUserId) return false;
    if (friendIds.has(account.id)) return false;
    if (friendHandles.has(account.handle.toLowerCase())) return false;
    return true;
  });
}

export function sampleAccountToFriend(account: UserAccount): Friend {
  return toFriend(account);
}

export function createBlankAccount(
  name: string,
  handle: string | undefined,
  password: string,
  bio?: string,
): UserAccount {
  const cleanName = name.trim();
  const derivedHandle =
    handle?.trim().replace(/^@/, '') ||
    cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18) ||
    `user${Date.now().toString().slice(-4)}`;

  return {
    id: `u_${Date.now()}`,
    name: cleanName,
    handle: derivedHandle,
    password,
    bio: bio?.trim() || 'Nueva cuenta en Page2Screen.',
    works: [],
    friends: [],
    isSample: false,
  };
}

export function seedAccounts(): { accounts: UserAccount[]; currentUserId: string } {
  return {
    accounts: SAMPLE_ACCOUNTS.map((account) => ({
      ...account,
      works: account.works.map((w) => ({ ...w })),
      friends: [],
    })),
    currentUserId: PRIMARY_USER_ID,
  };
}

export function findAccountByHandle(
  accounts: UserAccount[],
  handle: string,
): UserAccount | undefined {
  const needle = handle.trim().replace(/^@/, '').toLowerCase();
  return accounts.find((a) => a.handle.toLowerCase() === needle);
}
