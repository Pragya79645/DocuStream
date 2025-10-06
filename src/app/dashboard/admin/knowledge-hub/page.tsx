'use client';

import { Suspense } from 'react';
import { KnowledgeHub } from '@/components/admin/knowledge-hub';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function KnowledgeHubPageComponent() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'admin') {
    // Redirect non-admin users or show an unauthorized message
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    // Return a loading/unauthorized message while redirecting
    return (
        <div className="py-4">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p>You do not have permission to view this page. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="py-4">
      <KnowledgeHub />
    </div>
  );
}

export default function KnowledgeHubPage() {
    return (
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
            <KnowledgeHubPageComponent />
        </Suspense>
    )
}