import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Work, Friend } from '../types';
import { getItem, setItem } from '../utils/storage';
import {
  SAMPLE_ACCOUNTS,
  PRIMARY_USER_ID,
  createBlankAccount,
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
  addWork: (work: Work) => void;
  updateWork: (id: string, updates: Partial<Work>) => void;
  removeWork: (id: string) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  addSuggestedFriend: (accountId: string) => void;
  setProfileName: (name: string) => void;
  setProfileHandle: (handle: string) => void;
  setProfileBio: (bio: string) => void;
  createUser: (name: string, handle?: string, bio?: string) => void;
  switchUser: (userId: string) => void;
}

const LibraryContext = createContext<LibraryState | undefined>(undefined);

const ACCOUNTS_KEY = 'p2s_accounts_v2';
const CURRENT_KEY = 'p2s_current_user_v2';

function loadInitialState() {
  const storedAccounts = getItem<UserAccount[] | null>(ACCOUNTS_KEY, null);
  const storedCurrent = localStorage.getItem(CURRENT_KEY);

  if (!storedAccounts || storedAccounts.length === 0) {
    return seedAccounts();
  }

  const currentUserId =
    storedCurrent && storedAccounts.some((a) => a.id === storedCurrent)
      ? storedCurrent
      : storedAccounts[0].id;

  return { accounts: storedAccounts, currentUserId };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const initial = loadInitialState();
  const [accounts, setAccounts] = useState<UserAccount[]>(initial.accounts);
  const [currentUserId, setCurrentUserId] = useState(initial.currentUserId);

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

  const createUser = (name: string, handle?: string, bio?: string) => {
    const account = createBlankAccount(name, handle, bio);
    setAccounts((prev) => [...prev, account]);
    setCurrentUserId(account.id);
  };

  const switchUser = (userId: string) => {
    if (accounts.some((a) => a.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const friendSuggestions = useMemo(
    () => getSampleSuggestions(currentUser.id, currentUser.friends),
    [currentUser],
  );

  return (
    <LibraryContext.Provider
      value={{
        works: currentUser.works,
        friends: currentUser.friends,
        profileName: currentUser.name,
        profileHandle: currentUser.handle,
        profileBio: currentUser.bio,
        currentUserId: currentUser.id,
        accounts,
        friendSuggestions,
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
        switchUser,
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
