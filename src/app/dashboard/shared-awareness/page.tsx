'use client';

import { SharedAwarenessDashboard } from '@/components/dashboard/shared-awareness-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types';
import { getCategories } from '@/lib/services/categories.service';
import { Loader2 } from 'lucide-react';

export default function SharedAwarenessDashboardPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchCategories();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view shared awareness dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Shared Awareness Dashboard</h1>
        <p className="text-muted-foreground">
          Documents and compliance items affecting multiple departments
        </p>
      </div>
      
      <SharedAwarenessDashboard 
        userDepartmentIds={currentUser.categoryIds}
        categories={categories}
      />
    </div>
  );
}