import { connectToDatabase } from '@/lib/mongodb';
import { FoodItem } from '@/lib/models/FoodItem';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const item = await FoodItem.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }

    // Check if user owns this item
    if (item.userId.toString() !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await FoodItem.deleteOne({ _id: params.id });

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete food item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    await connectToDatabase();

    const item = await FoodItem.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }

    // Check if user owns this item
    if (item.userId.toString() !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    Object.assign(item, updates);
    await item.save();

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Update food item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
