'use client';

import { ComplianceDeadlines } from '@/components/dashboard/compliance-deadlines';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Document } from '@/lib/types';
import { listenToDocumentsForUser } from '@/lib/client-services/documents.client.service';
import { Loader2 } from 'lucide-react';

export default function ComplianceDeadlinesPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || authLoading) return;

    const unsubscribe = listenToDocumentsForUser(
      currentUser.id,
      currentUser.categoryIds,
      (documents) => {
        setUserDocuments(documents);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, authLoading]);

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
        <p className="text-muted-foreground">Please sign in to view compliance deadlines.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Compliance Deadlines</h1>
        <p className="text-muted-foreground">
          Track your assigned compliance tasks and deadlines
        </p>
      </div>
      
      <ComplianceDeadlines 
        userId={currentUser.id}
        userCategoryIds={currentUser.categoryIds}
        documents={userDocuments}
      />
    </div>
  );
}
