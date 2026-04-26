import { create } from 'zustand';
import * as UsersService from '../api/users-service';
import { getAccessToken } from '../api/token-storage';
import type { UserProfile, LoginPayload, RegisterPayload } from '../api/models';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const user = await UsersService.getProfile();
        set({ user, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      try {
        await UsersService.logout();
      } catch {}
      set({ user: null, isAuthenticated: false, isHydrated: true });
    } finally {
      set({ isHydrated: true });
    }
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      await UsersService.login(payload);
      const user = await UsersService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      await UsersService.register(payload);
      // Auto-login after registration
      await UsersService.login({ email: payload.email, password: payload.password });
      const user = await UsersService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const user = await UsersService.getProfile();
      set({ user });
    } catch {
      // silent fail – profile will stay stale
    }
  },

  logout: async () => {
    await UsersService.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
