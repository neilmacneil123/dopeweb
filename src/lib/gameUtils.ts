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

export const EVENTS = [
  {
    name: 'Police Bust',
    probability: 0.1,
    effect: (state: any) => {
      // Chance to lose inventory or cash
      return { ...state, cash: state.cash * 0.5 };
    },
  },
  {
    name: 'Found Stash',
    probability: 0.05,
    effect: (state: any) => {
      // Find some free drugs
      return { ...state, cash: state.cash * 1.2 };
    },
  },
] as const;

export function generateMarketPrices() {
  const prices: Record<string, number> = {};
  
  Object.entries(DRUGS).forEach(([drug, { minPrice, maxPrice }]) => {
    prices[drug] = Math.floor(
      minPrice + Math.random() * (maxPrice - minPrice)
    );
  });

  return prices;
}

export function generateRandomEvent() {
  const random = Math.random();
  let probabilitySum = 0;

  for (const event of EVENTS) {
    probabilitySum += event.probability;
    if (random <= probabilitySum) {
      return event;
    }
  }

  return null;
}