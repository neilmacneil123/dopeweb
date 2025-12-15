'use client';

import { useGameStore } from '@/lib/store/gameStore';

export const PlayerStatus = () => {
  const { cash, debt, bankAccount, health, currentCity, day, playersInCity } = useGameStore();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="text-xs text-slate-400">Day {day}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Cash</p>
          <p className="font-semibold">${cash.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Debt</p>
          <p className="font-semibold text-rose-400">${debt.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Bank</p>
          <p className="font-semibold text-emerald-400">${bankAccount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Health</p>
          <p className="font-semibold">{health}%</p>
        </div>
        <div>
          <p className="text-slate-400">City</p>
          <p className="font-semibold">{currentCity}</p>
        </div>
        <div>
          <p className="text-slate-400">Players Nearby</p>
          <p className="font-semibold">{playersInCity}</p>
        </div>
      </div>
    </div>
  );
};
