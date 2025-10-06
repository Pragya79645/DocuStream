'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DocumentListControls } from '@/components/dashboard/document-list-controls';
import { DocumentCard } from '@/components/dashboard/document-card';
import { ComplianceDeadlines } from '@/components/dashboard/compliance-deadlines';
import { SharedAwarenessDashboard } from '@/components/dashboard/shared-awareness-dashboard';
import { Document, User, Category } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { listenToDocumentsForUser } from '@/lib/client-services/documents.client.service';
import { getUsers } from '@/lib/services/users.service';
import { getCategories } from '@/lib/services/categories.service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { filterDocumentsByTargeting, TargetingFilter } from '@/lib/utils/document-targeting-utils';

export default function DashboardPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedTargeting, setSelectedTargeting] = useState<TargetingFilter>('all');

  // Filter documents based on completion status and targeting
  const filteredDocuments = useMemo(() => {
    // First filter by targeting
    const targetingFilteredDocs = filterDocumentsByTargeting(userDocuments, selectedTargeting);
    
    // Then filter by completion status
    return targetingFilteredDocs.filter(doc => {
      const completedActions = doc.actionPoints.filter(ap => ap.isCompleted).length;
      const totalActions = doc.actionPoints.length;
      const isCompleted = totalActions > 0 && completedActions === totalActions;
      const hasPendingActions = totalActions > 0 && completedActions < totalActions;

      switch (activeTab) {
        case 'completed':
          return isCompleted;
        case 'pending':
          return hasPendingActions;
        case 'all':
        default:
          return true;
      }
    });
  }, [userDocuments, activeTab, selectedTargeting]);

  useEffect(() => {
    async function fetchInitialData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [usersData, categoriesData] = await Promise.all([
          getUsers(),
          getCategories()
        ]);
        setAllUsers(usersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
            title: 'Error',
            description: 'Could not fetch initial data.',
            variant: 'destructive'
        })
      }
    }
    
    if (!authLoading) {
      fetchInitialData();
    }
  }, [currentUser, authLoading, toast]);


  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribe = listenToDocumentsForUser(currentUser.id, currentUser.categoryIds, (docs) => {
        setUserDocuments(docs);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);
  
  if (loading || authLoading || allUsers.length === 0) {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!currentUser) {
    // This should be handled by the layout's auth guard, but as a fallback:
    return <div>You must be logged in to view this page.</div>;
  }
  
  const assignedCategories = currentUser.categoryIds.length > 0 
    ? currentUser.categoryIds.join(', ')
    : 'None assigned';

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Compliance Deadlines Section */}
      <ComplianceDeadlines 
        userId={currentUser.id} 
        userCategoryIds={currentUser.categoryIds}
        documents={userDocuments}
      />
      
      {/* Shared Awareness Dashboard */}
      <SharedAwarenessDashboard 
        userDepartmentIds={currentUser.categoryIds}
        categories={categories}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">My Department Documents</h1>
          <p className="text-muted-foreground">
            Documents from your assigned categories ({assignedCategories}) and documents you have uploaded.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          {/* No longer need onUploadComplete because of real-time listeners */}
          <DocumentListControls 
            onUploadComplete={() => {}} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedTargeting={selectedTargeting}
            onTargetingChange={setSelectedTargeting}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map(doc => {
              const uploader = allUsers.find(u => u.id === doc.uploaderId);
              // We must have an uploader, but let's be safe.
              if (!uploader) return null; 
              return <DocumentCard key={doc.id} document={doc} uploader={uploader} />;
            })}
          </div>
           {filteredDocuments.length === 0 && !loading && (
              <div className="text-center py-10">
                <h3 className="text-xl font-semibold">
                  {activeTab === 'completed' && 'No completed documents found'}
                  {activeTab === 'pending' && 'No documents with pending actions found'}
                  {activeTab === 'all' && 'No documents found'}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? 'Upload a document or ask your admin to assign you to relevant categories.'
                    : `Switch to a different tab to view ${activeTab === 'completed' ? 'pending' : 'completed'} documents.`
                  }
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
