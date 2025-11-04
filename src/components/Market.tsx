'use client';

import { useGameStore } from '@/lib/store/gameStore';

export const Market = () => {
  const { prices, cash, inventory, maxInventory, buyDrug } = useGameStore();
  const totalInventory = inventory.reduce((acc, drug) => acc + drug.quantity, 0);

  const handleBuy = (drugName: string, price: number) => {
    if (cash >= price && totalInventory < maxInventory) {
      buyDrug(drugName, 1, price);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Market Prices</h2>
      <div className="space-y-2">
        {Object.entries(prices).map(([drug, price]) => (
          <div
            key={drug}
            className="flex items-center justify-between bg-gray-700 p-2 rounded"
          >
            <div>
              <p className="font-bold">{drug}</p>
              <p className="text-sm text-gray-400">${price.toLocaleString()}/unit</p>
            </div>
            <button
              onClick={() => handleBuy(drug, price)}
              disabled={cash < price || totalInventory >= maxInventory}
              className={`px-3 py-1 rounded ${
                cash < price || totalInventory >= maxInventory
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition`}
            >
              Buy 1
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};