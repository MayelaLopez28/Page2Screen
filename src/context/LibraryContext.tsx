import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Work, Friend } from '../types';
import { getItem, setItem } from '../utils/storage';
import { bumpRecSession } from '../utils/recommendationPrefs';
import {
  SAMPLE_ACCOUNTS,
  PRIMARY_USER_ID,
  createBlankAccount,
  findAccountByHandle,
  getSampleSuggestions,
  sampleAccountToFriend,
  seedAccounts,
  type UserAccount,
} from '../data/sampleUsers';

interface LibraryState {
  works: Work[];
  friends: Friend[];
  profileName: string;
  profileHandle: string;
  profileBio: string;
  currentUserId: string;
  accounts: UserAccount[];
  friendSuggestions: UserAccount[];
  isLoggedIn: boolean;
  addWork: (work: Work) => void;
  updateWork: (id: string, updates: Partial<Work>) => void;
  removeWork: (id: string) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  addSuggestedFriend: (accountId: string) => void;
  setProfileName: (name: string) => void;
  setProfileHandle: (handle: string) => void;
  setProfileBio: (bio: string) => void;
  /** Crea cuenta con contraseña. Devuelve error o null si OK. */
  createUser: (
    name: string,
    handle: string,
    password: string,
    bio?: string,
  ) => string | null;
  /** Login con usuario + contraseña. Devuelve error o null si OK. */
  loginWithCredentials: (handle: string, password: string) => string | null;
  logout: () => void;
}

const LibraryContext = createContext<LibraryState | undefined>(undefined);

const ACCOUNTS_KEY = 'p2s_accounts_v4';
const CURRENT_KEY = 'p2s_current_user_v4';
const SESSION_KEY = 'p2s_session_v4';

function normalizeAccounts(list: UserAccount[]): UserAccount[] {
  return list.map((account) => ({
    ...account,
    password: account.password || 'page2screen',
    works: account.works || [],
    friends: account.friends || [],
  }));
}

function loadInitialState() {
  const storedAccounts = getItem<UserAccount[] | null>(ACCOUNTS_KEY, null);
  const storedCurrent = localStorage.getItem(CURRENT_KEY);
  const sessionRaw = localStorage.getItem(SESSION_KEY);
  const isLoggedIn = sessionRaw === '1';

  if (!storedAccounts || storedAccounts.length === 0) {
    const seeded = seedAccounts();
    return { ...seeded, isLoggedIn: false };
  }

  const accounts = normalizeAccounts(storedAccounts);
  const currentUserId =
    storedCurrent && accounts.some((a) => a.id === storedCurrent)
      ? storedCurrent
      : accounts[0].id;

  return { accounts, currentUserId, isLoggedIn };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const initial = loadInitialState();
  const [accounts, setAccounts] = useState<UserAccount[]>(initial.accounts);
  const [currentUserId, setCurrentUserId] = useState(initial.currentUserId);
  const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn);

  const currentUser = useMemo(
    () => accounts.find((a) => a.id === currentUserId) || accounts[0] || SAMPLE_ACCOUNTS[0],
    [accounts, currentUserId],
  );

  useEffect(() => {
    setItem(ACCOUNTS_KEY, accounts);
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, isLoggedIn ? '1' : '0');
  }, [isLoggedIn]);

  const patchCurrent = (updater: (account: UserAccount) => UserAccount) => {
    setAccounts((prev) =>
      prev.map((account) => (account.id === currentUserId ? updater(account) : account)),
    );
  };

  const addWork = (work: Work) =>
    patchCurrent((account) => ({
      ...account,
      works: [work, ...account.works.filter((w) => w.id !== work.id)],
    }));

  const updateWork = (id: string, updates: Partial<Work>) =>
    patchCurrent((account) => ({
      ...account,
      works: account.works.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));

  const removeWork = (id: string) =>
    patchCurrent((account) => ({
      ...account,
      works: account.works.filter((w) => w.id !== id),
    }));

  const addFriend = (friend: Friend) =>
    patchCurrent((account) => ({
      ...account,
      friends: [...account.friends.filter((f) => f.id !== friend.id && f.name !== friend.name), friend],
    }));

  const removeFriend = (id: string) =>
    patchCurrent((account) => ({
      ...account,
      friends: account.friends.filter((f) => f.id !== id),
    }));

  const addSuggestedFriend = (accountId: string) => {
    const suggested =
      accounts.find((a) => a.id === accountId) ||
      SAMPLE_ACCOUNTS.find((a) => a.id === accountId);

    if (!suggested || suggested.id === currentUserId) {
      return;
    }

    addFriend(sampleAccountToFriend(suggested));
  };

  const setProfileName = (name: string) =>
    patchCurrent((account) => ({ ...account, name: name.trim() || account.name }));

  const setProfileHandle = (handle: string) =>
    patchCurrent((account) => ({
      ...account,
      handle: handle.trim().replace(/^@/, '') || account.handle,
    }));

  const setProfileBio = (bio: string) =>
    patchCurrent((account) => ({ ...account, bio: bio.trim() || account.bio }));

  const createUser = (
    name: string,
    handle: string,
    password: string,
    bio?: string,
  ): string | null => {
    if (name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (password.trim().length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres.';
    }
    const cleanHandle = handle.trim().replace(/^@/, '').toLowerCase();
    if (!cleanHandle) {
      return 'El usuario (@handle) es obligatorio.';
    }
    if (findAccountByHandle(accounts, cleanHandle)) {
      return 'Ese usuario ya existe. Elige otro handle.';
    }

    const account = createBlankAccount(name, cleanHandle, password.trim(), bio);
    setAccounts((prev) => [...prev, account]);
    setCurrentUserId(account.id);
    setIsLoggedIn(true);
    bumpRecSession(account.id);
    return null;
  };

  const loginWithCredentials = (handle: string, password: string): string | null => {
    if (!handle.trim()) {
      return 'Falta el usuario. Escribe tu @handle e inténtalo de nuevo.';
    }
    if (!password) {
      return 'Falta la contraseña. Escríbela e inténtalo de nuevo.';
    }
    const account = findAccountByHandle(accounts, handle);
    if (!account || account.password !== password) {
      return 'Usuario o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';
    }
    setCurrentUserId(account.id);
    setIsLoggedIn(true);
    bumpRecSession(account.id);
    return null;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const friendSuggestions = useMemo(
    () => getSampleSuggestions(currentUser.id, currentUser.friends),
    [currentUser],
  );

  return (
    <LibraryContext.Provider
      value={{
        works: isLoggedIn ? currentUser.works : [],
        friends: isLoggedIn ? currentUser.friends : [],
        profileName: currentUser.name,
        profileHandle: currentUser.handle,
        profileBio: currentUser.bio,
        currentUserId: currentUser.id,
        accounts,
        friendSuggestions: isLoggedIn ? friendSuggestions : [],
        isLoggedIn,
        addWork,
        updateWork,
        removeWork,
        addFriend,
        removeFriend,
        addSuggestedFriend,
        setProfileName,
        setProfileHandle,
        setProfileBio,
        createUser,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error('useLibrary debe usarse dentro de LibraryProvider');
  }
  return context;
};

export { PRIMARY_USER_ID };
