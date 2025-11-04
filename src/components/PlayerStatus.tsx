'use client';

import { useGameStore } from '@/lib/store/gameStore';

export const PlayerStatus = () => {
  const { cash, debt, bankAccount, health, currentCity, day } = useGameStore();

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Player Status</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Cash</p>
          <p className="font-bold">${cash.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Debt</p>
          <p className="font-bold text-red-500">${debt.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Bank</p>
          <p className="font-bold text-green-500">${bankAccount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Health</p>
          <p className="font-bold">{health}%</p>
        </div>
        <div>
          <p className="text-gray-400">Location</p>
          <p className="font-bold">{currentCity}</p>
        </div>
        <div>
          <p className="text-gray-400">Day</p>
          <p className="font-bold">{day}</p>
        </div>
      </div>
    </div>
  );
};