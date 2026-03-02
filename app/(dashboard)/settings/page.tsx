'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  height?: number;
  weight?: number;
  dailyCaloricGoal?: number;
  weightTarget?: string;
  targetWeight?: number;
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    dailyCaloricGoal: '2000',
    weightTarget: 'maintain',
    targetWeight: '',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        setUserData(data);
        setFormData({
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          dailyCaloricGoal: data.dailyCaloricGoal?.toString() || '2000',
          weightTarget: data.weightTarget || 'maintain',
          targetWeight: data.targetWeight?.toString() || '',
        });
      } catch (error) {
        console.error('Fetch user error:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        dailyCaloricGoal: parseInt(formData.dailyCaloricGoal),
        weightTarget: formData.weightTarget,
        targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : undefined,
      };

      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
        return;
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your profile and health goals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your email and basic profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-600">Email</Label>
            <p className="mt-2 font-medium text-slate-900">{userData?.email}</p>
            <p className="text-sm text-slate-500 mt-1">Your email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Profile</CardTitle>
          <CardDescription>Your physical measurements and health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  disabled={saving}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  disabled={saving}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Caloric Goal (kcal)</Label>
              <Input
                id="dailyGoal"
                type="number"
                placeholder="2000"
                value={formData.dailyCaloricGoal}
                onChange={(e) =>
                  setFormData({ ...formData, dailyCaloricGoal: e.target.value })
                }
                disabled={saving}
                min="1000"
                max="10000"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recommended: 2000-2500 kcal for adults
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Weight Goal</h3>

              <div className="space-y-2">
                <Label htmlFor="target">Goal Type</Label>
                <Select
                  value={formData.weightTarget}
                  onValueChange={(value) =>
                    setFormData({ ...formData, weightTarget: value })
                  }
                >
                  <SelectTrigger id="target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loss">Weight Loss</SelectItem>
                    <SelectItem value="gain">Weight Gain</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.weightTarget !== 'maintain' && (
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="65"
                    value={formData.targetWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, targetWeight: e.target.value })
                    }
                    disabled={saving}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
