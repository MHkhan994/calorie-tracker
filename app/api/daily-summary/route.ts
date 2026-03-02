import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DailySummary } from "@/lib/models/DailySummary";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateParam = request.nextUrl.searchParams.get("date");
    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const startDate = new Date(dateParam);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateParam);
    endDate.setHours(23, 59, 59, 999);

    const summary = await DailySummary.findOne({
      userId: session.userId,
      date: { $gte: startDate, $lt: endDate },
    });

    if (!summary) {
      return NextResponse.json(
        {
          totalCalories: 0,
          itemCount: 0,
          date: dateParam,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        totalCalories: summary.totalCalories,
        itemCount: summary.itemCount,
        date: dateParam,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Daily summary fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summary" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, totalCalories, itemCount } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    await connectToDatabase();

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const summary = await DailySummary.findOneAndUpdate(
      {
        userId: session.userId,
        date: { $gte: startDate, $lt: endDate },
      },
      {
        userId: session.userId,
        date: startDate,
        totalCalories,
        itemCount,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(
      {
        totalCalories: summary.totalCalories,
        itemCount: summary.itemCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Daily summary update error:", error);
    return NextResponse.json(
      { error: "Failed to update daily summary" },
      { status: 500 },
    );
  }
}
