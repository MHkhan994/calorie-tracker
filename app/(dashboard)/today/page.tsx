"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddFoodModal } from "@/components/add-food-modal";
import { FoodItemList } from "@/components/food-item-list";
import { DailySummary } from "@/components/daily-summary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FoodItem {
  _id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  caloriesCalculated?: number;
}

export default function TodayPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/food-items?date=${today}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      setItems(data);

      // Fetch daily summary
      const summaryResponse = await fetch(`/api/daily-summary?date=${today}`);
      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setTotalCalories(summary.totalCalories || 0);
      } else {
        // Fallback to calculating total from items
        const total = data.reduce(
          (sum: number, item: FoodItem) => sum + (item.caloriesCalculated || 0),
          0,
        );
        setTotalCalories(total);
      }

      // Fetch user's daily goal
      const userResponse = await fetch("/api/user");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setDailyGoal(userData.dailyCaloricGoal || 2000);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [router]);

  const handleCalculateCalories = async () => {
    if (items.length === 0) {
      toast("Add food items first");
      return;
    }

    setCalculating(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch("/api/calculate-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          items: items.map((item) => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to calculate calories");
        return;
      }

      const result = await response.json();

      // Update items with calculated calories
      const updatedItems = items.map((item) => {
        const itemCalories = result.items.find(
          (ic: any) => ic.name.toLowerCase() === item.name.toLowerCase(),
        );
        return {
          ...item,
          caloriesCalculated: itemCalories?.calories || 0,
        };
      });

      // Update food items in database
      for (let i = 0; i < updatedItems.length; i++) {
        await fetch(`/api/food-items/${updatedItems[i]._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caloriesCalculated: updatedItems[i].caloriesCalculated,
          }),
        });
      }

      setItems(updatedItems);
      setTotalCalories(result.totalCalories);

      toast.success(
        `Total calories: ${result.totalCalories} kcal${result.insights ? ` - ${result.insights}` : ""}`,
      );
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setCalculating(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900">Today's Food Log</h1>
        <p className="text-slate-600 mt-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <DailySummary
        totalCalories={totalCalories}
        dailyGoal={dailyGoal}
        itemCount={items.length}
      />

      <div className="flex gap-2">
        <AddFoodModal onFoodAdded={fetchItems} />
        <Button
          onClick={handleCalculateCalories}
          variant="outline"
          disabled={items.length === 0 || calculating}
        >
          {calculating ? "Calculating..." : "Calculate Calories (AI)"}
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Food Items
        </h2>
        <FoodItemList items={items} onItemDeleted={fetchItems} />
      </div>
    </div>
  );
}
