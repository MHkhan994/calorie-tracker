'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          router.push('/today');
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto">
          CT
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Calorie Tracker</h1>
        <p className="text-lg text-slate-600">Loading...</p>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mt-4" />
      </div>
    </div>
  );
}
