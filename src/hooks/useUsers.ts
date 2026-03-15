import { useState, useCallback } from 'react';
import { createUser, deleteUser, getUsers, updateUser } from '../services/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  createdAt?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(
    async (payload: CreateUserPayload): Promise<User> => {
      const { data } = await createUser(payload);
      setUsers(prev => [...prev, data]);
      return data;
    },
    [],
  );

  const editUser = useCallback(
    async (id: string, payload: UpdateUserPayload): Promise<User> => {
      const { data } = await updateUser(id, payload);
      setUsers(prev => prev.map(u => (u._id === id ? data : u)));
      return data;
    },
    [],
  );

  const removeUser = useCallback(async (id: string): Promise<void> => {
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u._id !== id));
  }, []);

  return {
    users,
    loading,
    refreshing,
    error,
    fetchUsers,
    refresh,
    addUser,
    editUser,
    removeUser,
  };
}
