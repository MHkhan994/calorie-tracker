import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { DailySummary } from "@/lib/models/DailySummary";

const calorieResponseSchema = z.object({
  totalCalories: z.number().describe("Total calories for all items"),
  items: z.array(
    z.object({
      name: z.string(),
      calories: z.number(),
    }),
  ),
  insights: z
    .string()
    .nullable()
    .describe("Brief health insights or recommendations"),
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, date } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No food items provided" },
        { status: 400 },
      );
    }

    const itemsDescription = items
      .map((item: any) => `${item.name} - ${item.amount}${item.unit}`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a nutrition expert. Calculate the total calories for the given food items based on standard nutritional values. 
Be accurate with portion sizes and provide realistic calorie estimates.
If an item is ambiguous, use a reasonable average estimate.
Provide brief health insights if relevant.

Calculate calories for these food items:
${itemsDescription}

Respond with ONLY a valid JSON object matching this schema: {"totalCalories": number, "items": [{"name": string, "calories": number}], "insights": string | null}`;

    const response = await model.generateContent(prompt);
    const content = response.response.text();

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from the response (in case it includes extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    const validated = calorieResponseSchema.parse(result);

    // Save daily summary if date is provided
    if (date) {
      await connectToDatabase();
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      await DailySummary.findOneAndUpdate(
        {
          userId: session.userId,
          date: {
            $gte: startDate,
            $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        {
          userId: session.userId,
          date: startDate,
          totalCalories: validated.totalCalories,
          itemCount: items.length,
        },
        { upsert: true },
      );
    }

    return NextResponse.json(validated, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("RATE_LIMIT")) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }
    console.error("Calorie calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate calories" },
      { status: 500 },
    );
  }
}
