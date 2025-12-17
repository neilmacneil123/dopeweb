"use client";

import { CITIES, type TerritoryStatus } from "@/lib/gameUtils";

interface MapProps {
  currentCity: (typeof CITIES)[number];
  territories: Record<(typeof CITIES)[number], TerritoryStatus>;
  currentPlayer: string;
  onTravel: (city: (typeof CITIES)[number]) => void;
  onCapture: (city: (typeof CITIES)[number]) => void;
  onDefend: (city: (typeof CITIES)[number]) => void;
}

type OwnerType = "self" | "other" | "neutral";

const ownerGradients: Record<OwnerType, string> = {
  self: "from-emerald-500/70 via-emerald-600/70 to-emerald-700/70",
  other: "from-rose-500/70 via-rose-600/70 to-rose-700/70",
  neutral: "from-slate-600/60 via-slate-700/60 to-slate-800/60",
};

function getOwnerType(owner: string | null, currentPlayer: string): OwnerType {
  if (!owner) return "neutral";
  return owner === currentPlayer ? "self" : "other";
}

function getOwnerCopy(ownerType: OwnerType, owner: string | null) {
  if (ownerType === "self") return "Your crew holds this turf.";
  if (ownerType === "other" && owner) return `${owner} runs this turf.`;
  return "No one runs this turf yet.";
}

export function Map({ currentCity, territories, currentPlayer, onTravel, onCapture, onDefend }: MapProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Territories</p>
          <h2 className="text-xl font-semibold">City Map</h2>
          <p className="text-sm text-slate-400">Hold turf for bragging rights. Contested zones bleed heat.</p>
        </div>
        <div className="hidden text-xs text-slate-400 sm:flex sm:flex-col sm:items-end">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> You</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /> Rival crews</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" /> Neutral</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city) => {
          const territory = territories[city] || { owner: null, contested: false, claimEndsAt: null };
          const isHere = city === currentCity;
          const ownerType = getOwnerType(territory.owner, currentPlayer);
          const ownerLabel = ownerType === "self" ? "You" : territory.owner ?? "Neutral";

          return (
            <div
              key={city}
              className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${ownerGradients[ownerType]} p-4 shadow-lg shadow-black/30`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-200/90">{city}</p>
                  <p className="text-sm text-slate-100/90">{getOwnerCopy(ownerType, territory.owner)}</p>
                </div>
                {territory.contested && (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase text-amber-100 ring-1 ring-amber-300/50">
                    Contested
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200/90">
                <span className={`rounded-full px-2 py-1 ${
                  ownerType === "self"
                    ? "bg-emerald-900/60 text-emerald-100 ring-1 ring-emerald-400/40"
                    : ownerType === "other"
                    ? "bg-rose-900/60 text-rose-100 ring-1 ring-rose-400/40"
                    : "bg-slate-900/60 text-slate-100 ring-1 ring-slate-300/20"
                }`}>
                  {ownerLabel}
                </span>
                {isHere && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-900/60 px-2 py-1 text-blue-100 ring-1 ring-blue-400/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                    Current City
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button
                  onClick={() => onTravel(city)}
                  className={`rounded-lg px-3 py-2 font-semibold transition ${
                    isHere
                      ? "cursor-not-allowed bg-slate-800/70 text-slate-300"
                    : "bg-slate-950/40 text-white ring-1 ring-white/10 hover:bg-slate-900/80"
                  }`}
                  disabled={isHere}
                >
                  {isHere ? "Here" : "Travel"}
                </button>
                <button
                  onClick={() => onCapture(city)}
                  className="rounded-lg bg-emerald-600/80 px-3 py-2 font-semibold text-white transition hover:bg-emerald-600"
                >
                  Capture
                </button>
                <button
                  onClick={() => onDefend(city)}
                  className="rounded-lg bg-amber-600/80 px-3 py-2 font-semibold text-white transition hover:bg-amber-600"
                >
                  Defend
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
