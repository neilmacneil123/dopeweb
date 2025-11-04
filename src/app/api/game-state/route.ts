import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GameState from '@/lib/models/GameState';
import { generateMarketPrices } from '@/lib/gameUtils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const prices = generateMarketPrices();
    const gameState = new GameState({
      city: 'Brooklyn',
      prices,
    });

    await gameState.save();

    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Game state error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}