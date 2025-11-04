import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    await connectDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const user = new User({
      username,
      password, // Will be hashed by the pre-save hook
      cash: 2000,
      debt: 5500,
      bankAccount: 0,
      rank: 'Newbie',
      highScore: 0,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      token,
      user: {
        username: user.username,
        cash: user.cash,
        debt: user.debt,
        bankAccount: user.bankAccount,
        rank: user.rank,
        highScore: user.highScore,
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}