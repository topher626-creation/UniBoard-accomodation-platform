import { create } from "zustand";
import { api } from "../services/api";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  updateUser: (userData: any) => void;
  // Compatibility setters used by useAuth.ts
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: any) => void;
}

type AuthLoginRegisterResult = { user: any; token?: string };

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = (await api.login(email, password)) as AuthLoginRegisterResult;
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      const response = (await api.register(userData)) as AuthLoginRegisterResult;
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          isAuthenticated: true,
        });
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },

  updateUser: (userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    set({ user: userData });
  },

  // Compatibility setters used by useAuth.ts hook
  setUser: (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  setToken: (token: string) => {
    localStorage.setItem("token", token);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (_error: any) => {
    // Error state is handled locally in components
  },
}));
