'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DailySummaryProps {
  totalCalories: number;
  dailyGoal?: number;
  itemCount: number;
}

export function DailySummary({
  totalCalories,
  dailyGoal = 2000,
  itemCount,
}: DailySummaryProps) {
  const percentage = (totalCalories / dailyGoal) * 100;
  const remaining = Math.max(0, dailyGoal - totalCalories);
  const isOverGoal = totalCalories > dailyGoal;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Today's Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-slate-600">Calories Consumed</p>
            <p className="text-2xl font-bold text-blue-600">{totalCalories}</p>
            <p className="text-xs text-slate-500 mt-1">kcal</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Daily Goal</p>
            <p className="text-2xl font-bold text-slate-900">{dailyGoal}</p>
            <p className="text-xs text-slate-500 mt-1">kcal</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Food Items</p>
            <p className="text-2xl font-bold text-slate-900">{itemCount}</p>
            <p className="text-xs text-slate-500 mt-1">added</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm font-semibold text-slate-900">
              {Math.min(100, Math.round(percentage))}%
            </span>
          </div>
          <Progress
            value={Math.min(100, percentage)}
            className="h-2"
          />
          <p className="text-xs text-slate-600">
            {isOverGoal
              ? `${totalCalories - dailyGoal} kcal over goal`
              : `${remaining} kcal remaining`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
