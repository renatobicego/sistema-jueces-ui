import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AmaUser, JuezSession } from "@/types";

interface AuthState {
  amaUser: AmaUser | null;
  amaToken: string | null;
  amaTokenExpiresAt: number | null;
  juezSession: JuezSession | null;
  juezSessionExpiresAt: number | null;

  setAmaAuth: (user: AmaUser, token: string) => void;
  setJuezSession: (session: JuezSession) => void;
  clearJuezSession: () => void;
  logout: () => void;
  isAmaTokenValid: () => boolean;
  isJuezSessionValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      amaUser: null,
      amaToken: null,
      amaTokenExpiresAt: null,
      juezSession: null,
      juezSessionExpiresAt: null,

      setAmaAuth: (user, token) => {
        const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
        set({
          amaUser: user,
          amaToken: token,
          amaTokenExpiresAt: Date.now() + TWO_WEEKS_MS,
        });
      },

      setJuezSession: (session) => {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        localStorage.setItem(`juezId_${session.torneoId}`, session.juezId);
        set({
          juezSession: session,
          juezSessionExpiresAt: Date.now() + ONE_DAY_MS,
        });
      },

      clearJuezSession: () => {
        set({ juezSession: null, juezSessionExpiresAt: null });
      },

      logout: () => {
        set({
          amaUser: null,
          amaToken: null,
          amaTokenExpiresAt: null,
          juezSession: null,
          juezSessionExpiresAt: null,
        });
      },

      isAmaTokenValid: () => {
        const { amaToken, amaTokenExpiresAt } = get();
        return (
          !!amaToken && !!amaTokenExpiresAt && Date.now() < amaTokenExpiresAt
        );
      },

      isJuezSessionValid: () => {
        const { juezSession, juezSessionExpiresAt } = get();
        return (
          !!juezSession &&
          !!juezSessionExpiresAt &&
          Date.now() < juezSessionExpiresAt
        );
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        amaUser: state.amaUser,
        amaToken: state.amaToken,
        amaTokenExpiresAt: state.amaTokenExpiresAt,
        juezSession: state.juezSession,
        juezSessionExpiresAt: state.juezSessionExpiresAt,
      }),
    },
  ),
);
