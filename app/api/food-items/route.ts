import { connectToDatabase } from '@/lib/mongodb';
import { FoodItem } from '@/lib/models/FoodItem';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    await connectToDatabase();

    let query: any = { userId: new Types.ObjectId(session.userId) };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.date = {
        $gte: today,
        $lt: tomorrow,
      };
    }

    const items = await FoodItem.find(query).sort({ createdAt: -1 });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Get food items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, name, amount, unit, date } = await request.json();

    if (!category || !name || amount === undefined || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const foodItem = new FoodItem({
      userId: new Types.ObjectId(session.userId),
      category,
      name,
      amount,
      unit,
      date: date ? new Date(date) : new Date(new Date().toDateString()),
    });

    await foodItem.save();

    return NextResponse.json(foodItem, { status: 201 });
  } catch (error) {
    console.error('Create food item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
