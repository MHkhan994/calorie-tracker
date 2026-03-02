"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CategoryData {
  category: string;
  count: number;
  calories: number;
}

const COLORS = ["#2563eb", "#7c3aed", "#ec4899", "#f59e0b", "#10b981"];

export default function AnalyticsPage() {
  const [categoryData, setcategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    totalItems: 0,
    avgPerDay: 0,
    favoriteCategory: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get user's daily goal
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
          }
          return;
        }

        // Fetch food items for the last 30 days
        const categoryMap: Record<string, { count: number; calories: number }> =
          {};
        let totalItems = 0;
        let daysWithData = 0;
        let totalCalories = 0;

        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          const response = await fetch(`/api/food-items?date=${dateStr}`);
          if (response.ok) {
            const items = await response.json();

            items.forEach((item: any) => {
              totalItems++;
              const category = item.category.replace(/_/g, " ");

              if (!categoryMap[category]) {
                categoryMap[category] = { count: 0, calories: 0 };
              }

              categoryMap[category].count++;
              categoryMap[category].calories += item.caloriesCalculated || 0;
              totalCalories += item.caloriesCalculated || 0;
            });

            if (items.length > 0) {
              daysWithData++;
            }
          }
        }

        const chartData = Object.entries(categoryMap).map(
          ([category, data]) => ({
            name: category,
            value: data.count,
          }),
        );

        setcategoryData(chartData);

        const favoriteCategory =
          Object.entries(categoryMap).reduce((a, b) =>
            a[1].count > b[1].count ? a : b,
          )?.[0] || "N/A";

        setInsights({
          totalItems,
          avgPerDay:
            daysWithData > 0 ? Math.round(totalItems / daysWithData) : 0,
          favoriteCategory:
            favoriteCategory.charAt(0).toUpperCase() +
            favoriteCategory.slice(1),
        });
      } catch (error) {
        console.error("Fetch analytics error:", error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router, toast]);

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
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">
          Your 30-day food tracking insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Total Items</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {insights.totalItems}
              </p>
              <p className="text-xs text-slate-500 mt-1">last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Avg Per Day</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {insights.avgPerDay}
              </p>
              <p className="text-xs text-slate-500 mt-1">items logged</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                Favorite Category
              </p>
              <p className="text-3xl font-bold text-pink-600 mt-2 truncate">
                {insights.favoriteCategory}
              </p>
              <p className="text-xs text-slate-500 mt-1">most logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl mt-1">💡</span>
              <div>
                <p className="font-medium text-slate-900">
                  Consistent Tracking
                </p>
                <p className="text-sm text-slate-600">
                  You've logged{" "}
                  {insights.totalItems > 0 ? "an excellent" : "minimal"} number
                  of meals. Keep it up!
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl mt-1">🎯</span>
              <div>
                <p className="font-medium text-slate-900">Food Variety</p>
                <p className="text-sm text-slate-600">
                  Try to maintain a balanced intake across different food
                  categories for optimal nutrition.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl mt-1">✨</span>
              <div>
                <p className="font-medium text-slate-900">Daily Goal</p>
                <p className="text-sm text-slate-600">
                  Monitor your calorie intake against your daily goal to stay on
                  track with your fitness objectives.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
