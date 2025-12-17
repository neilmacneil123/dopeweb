"use server";

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        username: user.username,
        cash: user.cash,
        debt: user.debt,
        bankAccount: user.bankAccount,
        rank: user.rank,
        highScore: user.highScore,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
