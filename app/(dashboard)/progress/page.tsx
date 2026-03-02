'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ChartData {
  date: string;
  calories: number;
  goal: number;
}

export default function ProgressPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    weeklyAverage: 0,
    highestDay: 0,
    lowestDay: 0,
    daysCompleted: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Get user's daily goal
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
          }
          return;
        }

        const userData = await userResponse.json();
        const dailyGoal = userData.dailyCaloricGoal || 2000;

        // Fetch food items for the last 7 days
        const data: ChartData[] = [];
        let totalCalories = 0;
        let maxCalories = 0;
        let minCalories = Infinity;
        let daysWithData = 0;

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const response = await fetch(`/api/food-items?date=${dateStr}`);
          if (response.ok) {
            const items = await response.json();
            const dayTotal = items.reduce(
              (sum: number, item: any) => sum + (item.caloriesCalculated || 0),
              0
            );

            if (dayTotal > 0) {
              daysWithData++;
              totalCalories += dayTotal;
              maxCalories = Math.max(maxCalories, dayTotal);
              minCalories = Math.min(minCalories, dayTotal);
            }

            data.push({
              date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              calories: dayTotal,
              goal: dailyGoal,
            });
          }
        }

        setChartData(data);
        setStats({
          weeklyAverage: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0,
          highestDay: maxCalories,
          lowestDay: minCalories === Infinity ? 0 : minCalories,
          daysCompleted: daysWithData,
        });
      } catch (error) {
        console.error('Fetch progress error:', error);
        toast.error('Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Progress</h1>
        <p className="text-slate-600 mt-2">Track your calorie intake over time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Weekly Average</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {stats.weeklyAverage}
              </p>
              <p className="text-xs text-slate-500 mt-1">kcal/day</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Highest Day</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {stats.highestDay}
              </p>
              <p className="text-xs text-slate-500 mt-1">kcal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Lowest Day</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {stats.lowestDay}
              </p>
              <p className="text-xs text-slate-500 mt-1">kcal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Days Logged</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.daysCompleted}
              </p>
              <p className="text-xs text-slate-500 mt-1">out of 7</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#2563eb"
                name="Calories Consumed"
              />
              <Line
                type="monotone"
                dataKey="goal"
                stroke="#10b981"
                strokeDasharray="5 5"
                name="Daily Goal"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories" fill="#2563eb" name="Calories Consumed" />
              <Bar dataKey="goal" fill="#e5e7eb" name="Daily Goal" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
