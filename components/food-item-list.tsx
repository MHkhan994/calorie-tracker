'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface FoodItem {
  _id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  caloriesCalculated?: number;
}

interface FoodItemListProps {
  items: FoodItem[];
  onItemDeleted: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    solid_food: 'bg-amber-100 text-amber-800',
    drink: 'bg-blue-100 text-blue-800',
    dessert: 'bg-pink-100 text-pink-800',
    snack: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.other;
};

export function FoodItemList({ items, onItemDeleted }: FoodItemListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete food item');
        return;
      }

      toast.success('Food item deleted');

      onItemDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium">No food items added yet</p>
            <p className="text-sm mt-1">Add your first food item to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item._id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
                    {item.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {item.amount} {item.unit}
                </p>
                {item.caloriesCalculated && (
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    {item.caloriesCalculated} kcal
                  </p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deletingId === item._id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {item.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                  <div className="flex gap-3 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
