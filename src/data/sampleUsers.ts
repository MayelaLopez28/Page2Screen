import type { Friend, Work } from '../types';
import { mockWorks } from './mock';

export interface UserAccount {
  id: string;
  name: string;
  handle: string;
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

export const SAMPLE_ACCOUNTS: UserAccount[] = [
  {
    id: PRIMARY_USER_ID,
    name: 'Mayela Lopez',
    handle: 'mayelalopez',
    bio: 'Fundadora de Page2Screen. Cruza libros y cine sin parar.',
    works: pickWorks('b_OL45804W', 'm_157336', 'b_OL82563W', 'm_27205'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_andrea',
    name: 'Andrea Lopez',
    handle: 'andrealopez',
    bio: 'Romance contemporáneo y thrillers de domingo.',
    works: pickWorks('b_OL27448W', 'm_11', 'b_OL24377594W'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_regina',
    name: 'Regina Sosa',
    handle: 'reginasosa',
    bio: 'Fantasía épica, relecturas y cine de autor.',
    works: pickWorks('b_OL45804W', 'm_694', 'm_27205'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_daniel',
    name: 'Daniel Dorador',
    handle: 'danieldorador',
    bio: 'Sci-fi hard y películas que duelen bonito.',
    works: pickWorks('m_157336', 'b_OL24377594W', 'm_11'),
    friends: [],
    isSample: true,
  },
  {
    id: 'u_daniela',
    name: 'Daniela Leal',
    handle: 'danielaleal',
    bio: 'Clásicos, DNFs honestos y listas por ver eternas.',
    works: pickWorks('b_OL82563W', 'm_694', 'b_OL27448W'),
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

export function createBlankAccount(name: string, handle?: string, bio?: string): UserAccount {
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
