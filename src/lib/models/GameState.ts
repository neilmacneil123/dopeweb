import mongoose from 'mongoose';
import { createDefaultTerritories, type TerritoryMap } from '@/lib/gameUtils';

const gameStateSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  prices: {
    cocaine: Number,
    heroin: Number,
    acid: Number,
    weed: Number,
    speed: Number,
    ludes: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  territories: {
    type: Map,
    of: {
      owner: String,
      contested: Boolean,
      claimEndsAt: Number,
    },
    default: createDefaultTerritories,
  },
});

export type GameStateDocument = mongoose.Document & {
  city: string;
  prices: {
    cocaine: number;
    heroin: number;
    acid: number;
    weed: number;
    speed: number;
    ludes: number;
  };
  timestamp: Date;
  territories: TerritoryMap;
};

export default mongoose.models.GameState || mongoose.model<GameStateDocument>('GameState', gameStateSchema);