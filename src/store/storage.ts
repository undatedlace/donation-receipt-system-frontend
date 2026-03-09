import {AuthSession} from '../types/auth';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

interface StorageAdapter {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
}

const memoryStore = new Map<string, string>();

const fallbackStorage: StorageAdapter = {
  set: (key, value) => memoryStore.set(key, value),
  getString: key => memoryStore.get(key),
  delete: key => {
    memoryStore.delete(key);
  },
};

const createStorage = (): StorageAdapter => {
  try {
    const mmkv = require('react-native-mmkv') as {
      createMMKV: () => StorageAdapter;
    };
    return mmkv.createMMKV();
  } catch {
    return fallbackStorage;
  }
};

export const storage = createStorage();

export const setAuthSession = (session: AuthSession) => {
  storage.set(TOKEN_KEY, session.accessToken);
  storage.set(USER_KEY, JSON.stringify(session.user));
};

export const getAuthSession = (): AuthSession | null => {
  const accessToken = storage.getString(TOKEN_KEY);
  const userRaw = storage.getString(USER_KEY);

  if (!accessToken || !userRaw) {
    return null;
  }

  try {
    return {
      accessToken,
      user: JSON.parse(userRaw),
    } as AuthSession;
  } catch {
    storage.delete(TOKEN_KEY);
    storage.delete(USER_KEY);
    return null;
  }
};

export const getToken = () => storage.getString(TOKEN_KEY);

export const clearAuthSession = () => {
  storage.delete(TOKEN_KEY);
  storage.delete(USER_KEY);
};
