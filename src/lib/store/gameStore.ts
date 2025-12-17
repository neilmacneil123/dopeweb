import { create } from 'zustand';
import {
  CITIES,
  createDefaultTerritories,
  generateMarketPrices,
  generateRandomEvent,
  type DrugName,
  type MarketPrices,
  type TerritoryMap,
  type TerritoryStatus,
} from '@/lib/gameUtils';

export type InventoryItem = {
  name: DrugName;
  quantity: number;
  avgCost: number;
};

export type EventLog = {
  id: string;
  day: number;
  message: string;
  tone: 'info' | 'danger' | 'success';
};

export interface GameState {
  cash: number;
  debt: number;
  bankAccount: number;
  inventory: InventoryItem[];
  currentCity: (typeof CITIES)[number];
  day: number;
  prices: MarketPrices;
  health: number;
  maxInventory: number;
  playersInCity: number;
  events: EventLog[];
  territories: TerritoryMap;
}

interface GameActions {
  initialize: () => void;
  travel: (city: GameState['currentCity']) => void;
  nextDay: () => void;
  buyDrug: (drug: DrugName, quantity: number) => void;
  sellDrug: (drug: DrugName, quantity: number) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  payDebt: (amount: number) => void;
  reset: () => void;
  setPlayersInCity: (count: number) => void;
  setPricesFromServer: (prices: MarketPrices) => void;
  addEvent: (message: string, tone?: EventLog['tone']) => void;
  claimTerritory: (city: GameState['currentCity'], owner: string) => TerritoryStatus | null;
  defendTerritory: (city: GameState['currentCity'], owner: string) => TerritoryStatus | null;
  setTerritoryStatus: (city: GameState['currentCity'], status: TerritoryStatus) => void;
}

const MAX_EVENTS = 40;
const CLAIM_COST = 500;
const DEFEND_COST = 250;
const CLAIM_HEALTH_COST = 10;
const DEFEND_HEALTH_COST = 5;
const CLAIM_DURATION_MS = 5 * 60 * 1000;

const initialState: GameState = {
  cash: 2000,
  debt: 5500,
  bankAccount: 0,
  inventory: [],
  currentCity: 'Brooklyn',
  day: 1,
  prices: generateMarketPrices(),
  health: 100,
  maxInventory: 100,
  playersInCity: 1,
  events: [],
  territories: createDefaultTerritories(),
};

function addEventLog(state: GameState, message: string, tone: EventLog['tone'] = 'info', dayOverride?: number) {
  const entry: EventLog = {
    id: `${Date.now()}-${Math.random()}`,
    day: dayOverride ?? state.day,
    message,
    tone,
  };
  const nextEvents = [entry, ...state.events];
  if (nextEvents.length > MAX_EVENTS) {
    nextEvents.pop();
  }
  return nextEvents;
}

function applyRandomEvent(state: GameState): GameState {
  const event = generateRandomEvent();
  if (!event) return state;

  let cash = state.cash;
  let debt = state.debt;
  let health = Math.max(0, Math.min(100, state.health + (event.healthDelta || 0)));
  let inventory = state.inventory;

  if (typeof event.cashDelta === 'number') {
    if (event.cashDelta < 0 && Math.abs(event.cashDelta) < 1) {
      // Treat negative sub-1 values as percentage loss of current cash
      cash = Math.max(0, Math.floor(cash + cash * event.cashDelta));
    } else {
      cash = Math.max(0, cash + event.cashDelta);
    }
  }

  if (typeof event.debtDelta === 'number') {
    if (event.debtDelta > 0 && event.debtDelta < 1) {
      debt = Math.floor(debt + debt * event.debtDelta);
    } else {
      debt = Math.max(0, debt + event.debtDelta);
    }
  }

  if (event.inventoryLossRatio && event.inventoryLossRatio > 0) {
    inventory = state.inventory.map((item) => ({
      ...item,
      quantity: Math.max(0, Math.floor(item.quantity * (1 - event.inventoryLossRatio!))),
    })).filter((item) => item.quantity > 0);
  }

  return {
    ...state,
    cash,
    debt,
    health,
    inventory,
    events: addEventLog(state, event.message, event.tone),
  };
}

function advanceDay(state: GameState): GameState {
  const dailyInterest = 0.06;
  const newDebt = Math.floor(state.debt * (1 + dailyInterest));
  const prices = generateMarketPrices();
  const health = Math.max(0, state.health - 1); // slow decay to encourage movement

  const updatedState: GameState = {
    ...state,
    day: state.day + 1,
    debt: newDebt,
    prices,
    health,
    events: addEventLog(state, `Day ${state.day + 1}: Markets refreshed in ${state.currentCity}.`, 'info', state.day + 1),
  };

  return applyRandomEvent(updatedState);
}

export const useGameStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  initialize: () =>
    set(() => ({
      ...initialState,
      prices: generateMarketPrices(),
      territories: createDefaultTerritories(),
    })),

  travel: (city) =>
    set((state) => {
      if (state.currentCity === city) return state;
      const traveledState: GameState = {
        ...state,
        currentCity: city,
        events: addEventLog(state, `Traveled to ${city}.`, 'info', state.day + 1),
      };
      return advanceDay(traveledState);
    }),

  nextDay: () => set((state) => advanceDay(state)),

  buyDrug: (drug, quantity) =>
    set((state) => {
      const price = state.prices[drug];
      const totalCost = price * quantity;
      const totalInventory = state.inventory.reduce((acc, d) => acc + d.quantity, 0);

      if (totalCost > state.cash || totalInventory + quantity > state.maxInventory) {
        return {
          ...state,
          events: addEventLog(state, 'Cannot buy: insufficient cash or inventory space.', 'danger'),
        };
      }

      const existing = state.inventory.find((d) => d.name === drug);
      const inventory = existing
        ? state.inventory.map((d) =>
            d.name === drug
              ? {
                  ...d,
                  quantity: d.quantity + quantity,
                  avgCost: (d.avgCost * d.quantity + price * quantity) / (d.quantity + quantity),
                }
              : d
          )
        : [...state.inventory, { name: drug, quantity, avgCost: price }];

      return {
        ...state,
        cash: state.cash - totalCost,
        inventory,
        events: addEventLog(state, `Bought ${quantity} ${drug}.`, 'success'),
      };
    }),

  sellDrug: (drug, quantity) =>
    set((state) => {
      const price = state.prices[drug];
      const existing = state.inventory.find((d) => d.name === drug);
      if (!existing || existing.quantity < quantity) {
        return {
          ...state,
          events: addEventLog(state, 'Cannot sell: not enough inventory.', 'danger'),
        };
      }

      const inventory = state.inventory
        .map((d) =>
          d.name === drug ? { ...d, quantity: d.quantity - quantity } : d
        )
        .filter((d) => d.quantity > 0);

      return {
        ...state,
        cash: state.cash + price * quantity,
        inventory,
        events: addEventLog(state, `Sold ${quantity} ${drug}.`, 'success'),
      };
    }),

  deposit: (amount) =>
    set((state) => {
      const safeAmount = Math.min(amount, state.cash);
      if (safeAmount <= 0) return state;
      return {
        ...state,
        cash: state.cash - safeAmount,
        bankAccount: state.bankAccount + safeAmount,
        events: addEventLog(state, `Deposited $${safeAmount.toLocaleString()}.`, 'info'),
      };
    }),

  withdraw: (amount) =>
    set((state) => {
      const safeAmount = Math.min(amount, state.bankAccount);
      if (safeAmount <= 0) return state;
      return {
        ...state,
        cash: state.cash + safeAmount,
        bankAccount: state.bankAccount - safeAmount,
        events: addEventLog(state, `Withdrew $${safeAmount.toLocaleString()}.`, 'info'),
      };
    }),

  payDebt: (amount) =>
    set((state) => {
      const safeAmount = Math.min(amount, state.cash, state.debt);
      if (safeAmount <= 0) return state;
      return {
        ...state,
        cash: state.cash - safeAmount,
        debt: state.debt - safeAmount,
        events: addEventLog(state, `Paid back $${safeAmount.toLocaleString()} of debt.`, 'success'),
      };
    }),

  reset: () =>
    set(() => ({
      ...initialState,
      prices: generateMarketPrices(),
      territories: createDefaultTerritories(),
    })),

  setPlayersInCity: (count) => set((state) => ({ ...state, playersInCity: count })),

  setPricesFromServer: (prices) =>
    set((state) => ({
      ...state,
      prices,
      events: addEventLog(state, 'Market updated by another player.', 'info'),
    })),

  addEvent: (message, tone = 'info') =>
    set((state) => ({ ...state, events: addEventLog(state, message, tone) })),

  setTerritoryStatus: (city, status) =>
    set((state) => ({
      ...state,
      territories: {
        ...state.territories,
        [city]: status,
      },
      events: addEventLog(
        state,
        status.owner ? `${status.owner} updated control of ${city}.` : `${city} is open turf.`,
        'info'
      ),
    })),

  claimTerritory: (city, owner) => {
    let nextStatus: TerritoryStatus | null = null;
    set((state) => {
      const territory = state.territories[city];
      if (!territory) return state;

      if (state.cash < CLAIM_COST) {
        return {
          ...state,
          events: addEventLog(state, 'Not enough cash to claim territory.', 'danger'),
        };
      }

      const updatedHealth = Math.max(0, state.health - CLAIM_HEALTH_COST);
      const territoryStatus: TerritoryStatus = {
        owner,
        contested: true,
        claimEndsAt: Date.now() + CLAIM_DURATION_MS,
      };
      const updatedTerritories: TerritoryMap = {
        ...state.territories,
        [city]: territoryStatus,
      };

      nextStatus = territoryStatus;

      return {
        ...state,
        cash: state.cash - CLAIM_COST,
        health: updatedHealth,
        territories: updatedTerritories,
        events: addEventLog(
          state,
          `${owner} started claiming ${city}. Health -${CLAIM_HEALTH_COST}, Cash -$${CLAIM_COST.toLocaleString()}.`,
          'info'
        ),
      };
    });
    return nextStatus;
  },

  defendTerritory: (city, owner) => {
    let nextStatus: TerritoryStatus | null = null;
    set((state) => {
      const territory = state.territories[city];
      if (!territory || territory.owner !== owner) {
        return {
          ...state,
          events: addEventLog(state, 'Cannot defend a territory you do not control.', 'danger'),
        };
      }

      if (state.cash < DEFEND_COST) {
        return {
          ...state,
          events: addEventLog(state, 'Not enough cash to defend territory.', 'danger'),
        };
      }

      const updatedHealth = Math.max(0, state.health - DEFEND_HEALTH_COST);
      const territoryStatus: TerritoryStatus = {
        ...territory,
        contested: false,
        claimEndsAt: null,
      };
      const updatedTerritories: TerritoryMap = {
        ...state.territories,
        [city]: territoryStatus,
      };

      nextStatus = territoryStatus;

      return {
        ...state,
        cash: state.cash - DEFEND_COST,
        health: updatedHealth,
        territories: updatedTerritories,
        events: addEventLog(
          state,
          `${owner} defended ${city}. Health -${DEFEND_HEALTH_COST}, Cash -$${DEFEND_COST.toLocaleString()}.`,
          'success'
        ),
      };
    });
    return nextStatus;
  },
}));
