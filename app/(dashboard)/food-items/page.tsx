"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface FoodItem {
  _id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  caloriesCalculated?: number;
  date: string;
}

export default function FoodItemsPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const categories = ["solid_food", "drink", "dessert", "snack", "other"];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      solid_food: "bg-amber-100 text-amber-800",
      drink: "bg-blue-100 text-blue-800",
      dessert: "bg-pink-100 text-pink-800",
      snack: "bg-green-100 text-green-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch items from the last 30 days
        const allItems: FoodItem[] = [];

        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          const response = await fetch(`/api/food-items?date=${dateStr}`);

          if (!response.ok) {
            if (response.status === 401) {
              router.push("/login");
              return;
            }
            continue;
          }

          const dayItems = await response.json();
          allItems.push(
            ...dayItems.map((item: any) => ({
              ...item,
              date: dateStr,
            })),
          );
        }

        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load food items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [router]);

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, items]);

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
        <h1 className="text-3xl font-bold text-slate-900">Food Items</h1>
        <p className="text-slate-600 mt-2">Browse all logged food items</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                >
                  {cat.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center text-slate-500">
              <p className="text-lg font-medium">No food items found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item._id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {item.amount} {item.unit}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {item.caloriesCalculated && (
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {item.caloriesCalculated} kcal
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
