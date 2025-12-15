'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { type DrugName } from '@/lib/gameUtils';

export const Market = () => {
  const { prices, cash, inventory, maxInventory, buyDrug } = useGameStore();
  const totalInventory = inventory.reduce((acc, drug) => acc + drug.quantity, 0);

  const handleBuy = (drugName: DrugName) => {
    buyDrug(drugName, 1);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Market</h2>
        <p className="text-xs text-slate-400">
          Capacity {totalInventory}/{maxInventory}
        </p>
      </div>
      <div className="space-y-2">
        {Object.entries(prices).map(([drug, price]) => {
          const disabled = cash < price || totalInventory >= maxInventory;
          const name = drug as DrugName;
          return (
            <div
              key={drug}
              className="flex items-center justify-between rounded-lg bg-slate-800/80 p-3"
            >
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-slate-400">${price.toLocaleString()}/unit</p>
              </div>
              <button
                onClick={() => handleBuy(name)}
                disabled={disabled}
                className={`rounded px-3 py-1 text-sm font-semibold transition ${
                  disabled
                    ? 'cursor-not-allowed bg-slate-700 text-slate-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Buy 1
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
