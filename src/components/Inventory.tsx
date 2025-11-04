'use client';

import { useGameStore, Drug } from '@/lib/store/gameStore';

export const Inventory = () => {
  const { inventory, prices, cash, sellDrug } = useGameStore();

  const handleSell = (drug: Drug) => {
    if (drug.quantity > 0) {
      const currentPrice = prices[drug.name] || 0;
      sellDrug(drug.name, 1, currentPrice);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Inventory</h2>
      {inventory.length === 0 ? (
        <p className="text-gray-400">Your inventory is empty</p>
      ) : (
        <div className="space-y-2">
          {inventory.map((drug) => (
            <div
              key={drug.name}
              className="flex items-center justify-between bg-gray-700 p-2 rounded"
            >
              <div>
                <p className="font-bold">{drug.name}</p>
                <p className="text-sm text-gray-400">
                  Bought at ${drug.price.toLocaleString()}/unit
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{drug.quantity} units</p>
                <button
                  onClick={() => handleSell(drug)}
                  className="text-sm bg-green-600 px-2 py-1 rounded hover:bg-green-700 transition"
                >
                  Sell 1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};