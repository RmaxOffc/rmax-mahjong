import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      }
    }),
    { name: 'auth' }
  )
);

export const useWalletStore = create((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  updateBalance: (amount) => set((state) => ({ balance: state.balance + amount }))
}));

export const useGameStore = create((set) => ({
  currentGame: null,
  gameHistory: [],
  setCurrentGame: (game) => set({ currentGame: game }),
  endGame: () => set({ currentGame: null }),
  setHistory: (history) => set({ gameHistory: history })
}));
