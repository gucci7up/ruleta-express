import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken } from '../lib/api';

interface AdminUser { id: number; name: string; email: string; role: string; }

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null, isAuthenticated: false,
      setAuth: (user, accessToken) => {
        setAuthToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        setAuthToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'ruleta-admin-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAuthToken(state.accessToken);
      },
    },
  ),
);
