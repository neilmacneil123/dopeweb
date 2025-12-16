"use client";

import { useEffect, useState } from "react";
import { Map } from "@/components/Map";
import { Market } from "@/components/Market";
import { Inventory } from "@/components/Inventory";
import { PlayerStatus } from "@/components/PlayerStatus";
import { CITIES, type DrugName, type TerritoryStatus } from "@/lib/gameUtils";
import { useGameStore } from "@/lib/store/gameStore";
import { getSocket } from "@/lib/socketClient";

export default function Home() {
  const {
    initialize,
    currentCity,
    travel,
    nextDay,
    deposit,
    withdraw,
    payDebt,
    events,
    setPlayersInCity,
    setPricesFromServer,
    setTerritoryStatus,
    territories,
    claimTerritory,
    defendTerritory,
  } = useGameStore();

  const [depositValue, setDepositValue] = useState("500");
  const [withdrawValue, setWithdrawValue] = useState("500");
  const [debtValue, setDebtValue] = useState("500");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const socket = getSocket();

    const handlePresence = (payload: { city: string; count: number }) => {
      if (payload.city === currentCity) {
        setPlayersInCity(payload.count);
      }
    };

    const handleMarketBroadcast = (payload: { city: string; prices: Record<DrugName, number> }) => {
      if (payload.city === currentCity) {
        setPricesFromServer(payload.prices);
      }
    };

    const handleTerritoryUpdate = (payload: { city: (typeof CITIES)[number]; status: TerritoryStatus }) => {
      if (payload.city === currentCity) {
        setTerritoryStatus(payload.city, payload.status);
      }
    };

    socket.on("connect", () => {
      socket.emit("join-city", currentCity);
    });

    socket.on("presence", handlePresence);
    socket.on("market:broadcast", handleMarketBroadcast);
    socket.on("territory:state", handleTerritoryUpdate);

    return () => {
      socket.off("presence", handlePresence);
      socket.off("market:broadcast", handleMarketBroadcast);
      socket.off("territory:state", handleTerritoryUpdate);
    };
  }, [currentCity, setPlayersInCity, setPricesFromServer, setTerritoryStatus]);

  const handleTravel = (city: (typeof CITIES)[number]) => {
    if (city === currentCity) return;
    travel(city);
    const socket = getSocket();
    socket.emit("travel", city);
  };

  const handleNextDay = () => {
    nextDay();
    const socket = getSocket();
    const latestPrices = useGameStore.getState().prices;
    socket.emit("market:update", { city: currentCity, prices: latestPrices });
  };

  const handleCapture = (city: (typeof CITIES)[number]) => {
    claimTerritory(city, "You");
    const socket = getSocket();
    socket.emit("territory:capture", { city, owner: "You" });
  };

  const handleDefend = (city: (typeof CITIES)[number]) => {
    defendTerritory(city, "You");
    const socket = getSocket();
    socket.emit("territory:defend", { city, owner: "You" });
  };

  const depositNum = Number(depositValue) || 0;
  const withdrawNum = Number(withdrawValue) || 0;
  const debtNum = Number(debtValue) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-blue-900/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">DopeWars // Web</p>
            <h1 className="text-3xl font-bold">The Street Is Calling</h1>
            <p className="text-sm text-slate-400">Buy low, sell high. Watch the heat.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleNextDay}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Advance Day / Refresh Market
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              Multiplayer ready
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <PlayerStatus />
            <div className="md:col-span-2">
              <Map
                currentCity={currentCity}
                territories={territories}
                onTravel={handleTravel}
                onCapture={handleCapture}
                onDefend={handleDefend}
              />
            </div>
            <Market />
            <Inventory />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold mb-3">Cash & Debt</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    className="flex-1 rounded bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    value={depositValue}
                    onChange={(e) => setDepositValue(e.target.value)}
                    min={0}
                  />
                  <button
                    onClick={() => deposit(depositNum)}
                    className="rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Deposit
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    className="flex-1 rounded bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    value={withdrawValue}
                    onChange={(e) => setWithdrawValue(e.target.value)}
                    min={0}
                  />
                  <button
                    onClick={() => withdraw(withdrawNum)}
                    className="rounded bg-slate-700 px-3 py-2 font-semibold text-white hover:bg-slate-600 transition"
                  >
                    Withdraw
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    className="flex-1 rounded bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    value={debtValue}
                    onChange={(e) => setDebtValue(e.target.value)}
                    min={0}
                  />
                  <button
                    onClick={() => payDebt(debtNum)}
                    className="rounded bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    Pay Debt
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Daily interest hits automatically. Keep debt low or it will snowball.
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="text-lg font-semibold mb-3">Event Feed</h2>
              <div className="space-y-2 text-sm max-h-80 overflow-y-auto pr-1">
                {events.length === 0 && <p className="text-slate-500">Nothing yet. Make a move.</p>}
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-lg border px-3 py-2 ${
                      event.tone === "danger"
                        ? "border-rose-800/70 bg-rose-900/30 text-rose-100"
                        : event.tone === "success"
                        ? "border-emerald-800/70 bg-emerald-900/30 text-emerald-100"
                        : "border-slate-800 bg-slate-800/60 text-slate-100"
                    }`}
                  >
                    <p className="text-xs text-slate-400">Day {event.day}</p>
                    <p className="text-sm">{event.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
