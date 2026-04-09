import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AmaUser, JuezSession } from "@/types";

interface AuthState {
  amaUser: AmaUser | null;
  amaToken: string | null;
  juezSession: JuezSession | null;

  setAmaAuth: (user: AmaUser, token: string) => void;
  setJuezSession: (session: JuezSession) => void;
  clearJuezSession: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      amaUser: null,
      amaToken: null,
      juezSession: null,

      setAmaAuth: (user, token) => {
        set({ amaUser: user, amaToken: token });
      },

      setJuezSession: (session) => {
        localStorage.setItem(`juezId_${session.torneoId}`, session.juezId);
        set({ juezSession: session });
      },

      clearJuezSession: () => {
        set({ juezSession: null });
      },

      logout: () => {
        set({ amaUser: null, amaToken: null, juezSession: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        amaUser: state.amaUser,
        amaToken: state.amaToken,
        juezSession: state.juezSession,
      }),
    },
  ),
);
