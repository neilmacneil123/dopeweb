import { create } from 'zustand';

export interface Drug {
  name: string;
  price: number;
  quantity: number;
}

export interface GameState {
  cash: number;
  debt: number;
  bankAccount: number;
  inventory: Drug[];
  currentCity: string;
  day: number;
  prices: Record<string, number>;
  health: number;
  maxInventory: number;
}

interface GameActions {
  setCash: (cash: number) => void;
  setDebt: (debt: number) => void;
  setBankAccount: (amount: number) => void;
  updateInventory: (drugs: Drug[]) => void;
  setCurrentCity: (city: string) => void;
  setPrices: (prices: Record<string, number>) => void;
  incrementDay: () => void;
  setHealth: (health: number) => void;
  buyDrug: (drug: string, quantity: number, price: number) => void;
  sellDrug: (drug: string, quantity: number, price: number) => void;
  reset: () => void;
}

const initialState: GameState = {
  cash: 2000,
  debt: 5500,
  bankAccount: 0,
  inventory: [],
  currentCity: 'Brooklyn',
  day: 1,
  prices: {},
  health: 100,
  maxInventory: 100,
};

export const useGameStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  setCash: (cash) => set({ cash }),
  setDebt: (debt) => set({ debt }),
  setBankAccount: (amount) => set({ bankAccount: amount }),
  updateInventory: (drugs) => set({ inventory: drugs }),
  setCurrentCity: (city) => set({ currentCity: city }),
  setPrices: (prices) => set({ prices }),
  incrementDay: () => set((state) => ({ day: state.day + 1 })),
  setHealth: (health) => set({ health }),

  buyDrug: (drug, quantity, price) =>
    set((state) => {
      const totalCost = quantity * price;
      if (totalCost > state.cash) return state;
      if (state.inventory.reduce((acc, d) => acc + d.quantity, 0) + quantity > state.maxInventory) return state;

      const existingDrug = state.inventory.find((d) => d.name === drug);
      const newInventory = existingDrug
        ? state.inventory.map((d) =>
            d.name === drug
              ? { ...d, quantity: d.quantity + quantity, price: (d.price * d.quantity + price * quantity) / (d.quantity + quantity) }
              : d
          )
        : [...state.inventory, { name: drug, quantity, price }];

      return {
        ...state,
        cash: state.cash - totalCost,
        inventory: newInventory,
      };
    }),

  sellDrug: (drug, quantity, price) =>
    set((state) => {
      const existingDrug = state.inventory.find((d) => d.name === drug);
      if (!existingDrug || existingDrug.quantity < quantity) return state;

      const newInventory = state.inventory
        .map((d) =>
          d.name === drug ? { ...d, quantity: d.quantity - quantity } : d
        )
        .filter((d) => d.quantity > 0);

      return {
        ...state,
        cash: state.cash + quantity * price,
        inventory: newInventory,
      };
    }),

  reset: () => set(initialState),
}));