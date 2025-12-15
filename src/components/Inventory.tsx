'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { type DrugName } from '@/lib/gameUtils';

export const Inventory = () => {
  const { inventory, prices, sellDrug } = useGameStore();

  const handleSell = (drug: DrugName) => {
    sellDrug(drug, 1);
  };

  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-200">
        <h2 className="text-lg font-semibold">Inventory</h2>
        <p className="text-sm text-slate-400 mt-2">Your inventory is empty.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100">
      <h2 className="text-lg font-semibold mb-3">Inventory</h2>
      <div className="space-y-3">
        {inventory.map((item) => {
          const currentPrice = prices[item.name] || 0;
          const profitPerUnit = currentPrice - item.avgCost;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-slate-800/80 p-3"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-slate-400">
                  Avg cost ${item.avgCost.toLocaleString()} / unit
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.quantity} units</p>
                <p className={`text-xs ${profitPerUnit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profitPerUnit >= 0 ? '+' : ''}{profitPerUnit.toLocaleString()}/unit
                </p>
                <button
                  onClick={() => handleSell(item.name)}
                  className="mt-1 text-xs rounded bg-emerald-600 px-2 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Sell 1 (@ ${currentPrice.toLocaleString()})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
