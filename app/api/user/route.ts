import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(new Types.ObjectId(session.userId));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: user._id,
        email: user.email,
        height: user.height,
        weight: user.weight,
        dailyCaloricGoal: user.dailyCaloricGoal,
        weightTarget: user.weightTarget,
        targetWeight: user.targetWeight,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(session.userId),
      updates,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: user._id,
        email: user.email,
        height: user.height,
        weight: user.weight,
        dailyCaloricGoal: user.dailyCaloricGoal,
        weightTarget: user.weightTarget,
        targetWeight: user.targetWeight,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
