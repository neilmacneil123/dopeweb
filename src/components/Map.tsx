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
  self: "from-emerald-500/75 via-emerald-600/75 to-emerald-700/75",
  other: "from-rose-500/75 via-rose-600/75 to-rose-700/75",
  neutral: "from-slate-600/60 via-slate-700/60 to-slate-800/70",
};

const cityDepthCoordinates = [
  { x: -130, y: -60, z: -35 },
  { x: 0, y: -100, z: 20 },
  { x: 140, y: -55, z: -20 },
  { x: -155, y: 70, z: 15 },
  { x: -10, y: 35, z: -15 },
  { x: 155, y: 75, z: 28 },
] as const;

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
          <p className="text-xs uppercase tracking-wide text-slate-400">3D Territories</p>
          <h2 className="text-xl font-semibold">City Holo-Map</h2>
          <p className="text-sm text-slate-400">Drag your eyes across the grid, then move your crew to strike.</p>
        </div>
        <div className="hidden text-xs text-slate-400 sm:flex sm:flex-col sm:items-end">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> You</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /> Rival crews</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" /> Neutral</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="relative mx-auto h-[640px] w-full max-w-[880px] [perspective:1400px]">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_85%_5%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.9),rgba(2,6,23,1)_70%)]" />
          <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-8deg)_translateZ(-32px)]">
            <div className="absolute left-1/2 top-1/2 h-[440px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-cyan-300/20 bg-slate-950/40 shadow-[0_40px_120px_rgba(8,47,73,0.45)]" />
            <div className="absolute left-1/2 top-1/2 h-[440px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[linear-gradient(to_right,rgba(34,211,238,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.14)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {CITIES.map((city, index) => {
              const territory = territories[city] || { owner: null, contested: false, claimEndsAt: null };
              const isHere = city === currentCity;
              const ownerType = getOwnerType(territory.owner, currentPlayer);
              const ownerLabel = ownerType === "self" ? "You" : territory.owner ?? "Neutral";
              const pos = cityDepthCoordinates[index % cityDepthCoordinates.length];

              return (
                <div
                  key={city}
                  className="absolute left-1/2 top-1/2 w-[220px]"
                  style={{
                    transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(-58deg) rotateZ(8deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-gradient-to-br ${ownerGradients[ownerType]} p-3 shadow-[0_22px_45px_rgba(2,6,23,0.75)] ring-1 ring-white/10 transition hover:-translate-y-1`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-100/95">{city}</p>
                        <p className="text-[11px] text-slate-100/85">{getOwnerCopy(ownerType, territory.owner)}</p>
                      </div>
                      {territory.contested && (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-100 ring-1 ring-amber-300/50">
                          Contested
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1 text-[10px] text-slate-200/95">
                      <span className={`rounded-full px-2 py-0.5 ${
                        ownerType === "self"
                          ? "bg-emerald-900/60 text-emerald-100 ring-1 ring-emerald-400/40"
                          : ownerType === "other"
                            ? "bg-rose-900/60 text-rose-100 ring-1 ring-rose-400/40"
                            : "bg-slate-900/60 text-slate-100 ring-1 ring-slate-300/20"
                      }`}>
                        {ownerLabel}
                      </span>
                      {isHere && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-900/60 px-2 py-0.5 text-blue-100 ring-1 ring-blue-400/40">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                          Current City
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 text-[11px]">
                      <button
                        onClick={() => onTravel(city)}
                        className={`rounded-md px-2 py-1 font-semibold transition ${
                          isHere
                            ? "cursor-not-allowed bg-slate-800/80 text-slate-300"
                            : "bg-slate-950/50 text-white ring-1 ring-white/10 hover:bg-slate-900/85"
                        }`}
                        disabled={isHere}
                      >
                        {isHere ? "Here" : "Travel"}
                      </button>
                      <button
                        onClick={() => onCapture(city)}
                        className="rounded-md bg-emerald-600/85 px-2 py-1 font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Capture
                      </button>
                      <button
                        onClick={() => onDefend(city)}
                        className="rounded-md bg-amber-600/85 px-2 py-1 font-semibold text-white transition hover:bg-amber-600"
                      >
                        Defend
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
