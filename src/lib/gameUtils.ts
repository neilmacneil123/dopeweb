export const CITIES = [
  'Brooklyn',
  'Manhattan',
  'Bronx',
  'Queens',
  'Staten Island',
  'Jersey City',
] as const;

export const DRUGS = {
  Cocaine: { minPrice: 15000, maxPrice: 29000 },
  Heroin: { minPrice: 5000, maxPrice: 13000 },
  Acid: { minPrice: 1000, maxPrice: 4400 },
  Weed: { minPrice: 300, maxPrice: 900 },
  Speed: { minPrice: 70, maxPrice: 250 },
  Ludes: { minPrice: 10, maxPrice: 60 },
} as const;

export type DrugName = keyof typeof DRUGS;
export type MarketPrices = Record<DrugName, number>;

type EventTone = 'info' | 'danger' | 'success';

export type RandomEventResult = {
  message: string;
  tone: EventTone;
  cashDelta?: number;
  debtDelta?: number;
  healthDelta?: number;
  inventoryLossRatio?: number;
};

export function generateMarketPrices(): MarketPrices {
  const prices = {} as MarketPrices;

  Object.entries(DRUGS).forEach(([drug, { minPrice, maxPrice }]) => {
    const spread = maxPrice - minPrice;
    const volatility = 0.25 + Math.random() * 0.5; // 25-75% of the spread to make markets feel swingy
    const direction = Math.random() > 0.5 ? 1 : -1;
    const movement = spread * volatility * direction;
    const candidate = (minPrice + maxPrice) / 2 + movement;
    prices[drug as DrugName] = Math.max(minPrice, Math.min(maxPrice, Math.floor(candidate)));
  });

  return prices;
}

export function generateRandomEvent(): RandomEventResult | null {
  const roll = Math.random();

  // Police bust
  if (roll < 0.1) {
    const inventoryLossRatio = 0.35;
    return {
      message: 'Police bust! You lost some stash and cash running from the cops.',
      tone: 'danger',
      cashDelta: -0.35, // apply as percentage of current cash
      inventoryLossRatio,
      healthDelta: -10,
    };
  }

  // Found stash
  if (roll < 0.18) {
    const stash = 500 + Math.floor(Math.random() * 2500);
    return {
      message: `Found a hidden stash worth $${stash.toLocaleString()}.`,
      tone: 'success',
      cashDelta: stash,
    };
  }

  // Lone shark interest spike
  if (roll < 0.23) {
    return {
      message: 'Loan shark tacks on extra interest.',
      tone: 'danger',
      debtDelta: Math.random() * 0.15, // 0-15% increase
    };
  }

  return null;
}
