'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getCategories } from '@/lib/services/categories.service';
import { CrossDepartmentFeed } from '@/components/dashboard/cross-department-feed';
import { Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function CrossDepartmentPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading cross-department feed...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <CrossDepartmentFeed categories={categories} />
    </div>
  );
}