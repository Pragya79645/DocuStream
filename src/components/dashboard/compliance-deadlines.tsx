'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { ComplianceDocument, ComplianceStatus, Document } from '@/lib/types';
import { ComplianceClientService } from '@/lib/client-services/compliance.client.service';
import { listenToDocumentsForUser } from '@/lib/client-services/documents.client.service';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface ComplianceDeadlinesProps {
  userId: string;
  userCategoryIds: string[];
  documents?: Document[]; // Optional documents prop to avoid duplicate fetching
}

export function ComplianceDeadlines({ userId, userCategoryIds, documents }: ComplianceDeadlinesProps) {
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);
  const [userDocuments, setUserDocuments] = useState<Document[]>(documents || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents for this user if not provided
  useEffect(() => {
    if (!documents && userId && userCategoryIds) {
      const unsubscribe = listenToDocumentsForUser(userId, userCategoryIds, (docs) => {
        console.log(`User documents updated: ${docs.length} documents found for user ${userId}`);
        setUserDocuments(docs);
      });
      return () => unsubscribe();
    } else if (documents) {
      console.log(`Using provided documents: ${documents.length} documents`);
      setUserDocuments(documents);
    }
  }, [userId, userCategoryIds, documents]);

  useEffect(() => {
    const fetchUserCompliance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user-specific compliance documents
        const userCompliance: ComplianceDocument[] = await ComplianceClientService.getComplianceByUser(userId);
        
        // Always filter compliance documents to only include those with valid uploaded documents
        const validDocumentIds = userDocuments.map(doc => doc.id);
        const validCompliance = userCompliance.filter(comp => {
          // Only include compliance items that have a corresponding real uploaded document
          const hasValidDocument = validDocumentIds.includes(comp.documentId);
          const hasValidDocumentId = comp.documentId && comp.documentId.trim() !== '';
          
          if (!hasValidDocumentId) {
            console.log(`Filtering out compliance item "${comp.title}" - empty or invalid document ID`);
            return false;
          }
          
          if (!hasValidDocument) {
            console.log(`Filtering out compliance item "${comp.title}" - document ID "${comp.documentId}" not found in user's uploaded documents`);
            return false;
          }
          
          return true;
        });
        
        console.log(`Found ${userCompliance.length} compliance items, ${validCompliance.length} have valid documents`);
        setComplianceDocuments(validCompliance);
      } catch (err) {
        console.error('Error fetching compliance deadlines:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch compliance when we have user documents loaded (or confirmed empty)
    if (userId && userDocuments !== undefined) {
      fetchUserCompliance();
    }
  }, [userId, userDocuments]);

  const getStatusColor = (status: ComplianceStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'due-soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'on-track':
        return <Clock className="h-4 w-4" />;
      case 'due-soon':
        return <AlertTriangle className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const calculateProgress = (complianceDoc: ComplianceDocument): number => {
    const relatedDoc = userDocuments.find((doc: Document) => doc.id === complianceDoc.documentId);
    if (!relatedDoc || !relatedDoc.actionPoints || relatedDoc.actionPoints.length === 0) {
      return complianceDoc.status === 'completed' ? 100 : 0;
    }

    const completedActions = relatedDoc.actionPoints.filter((ap: any) => ap.isCompleted).length;
    return Math.round((completedActions / relatedDoc.actionPoints.length) * 100);
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date();
    const due = parseISO(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDueDate = (dueDate: string): string => {
    try {
      return format(parseISO(dueDate), 'MMM dd, yyyy');
    } catch {
      return dueDate;
    }
  };

  const sortedCompliance = complianceDocuments.sort((a, b) => {
    // Sort by status priority (overdue, due-soon, on-track, completed) then by due date
    const statusPriority: Record<ComplianceStatus, number> = {
      'overdue': 1,
      'due-soon': 2,
      'on-track': 3,
      'completed': 4,
    };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compliance Deadlines
          </CardTitle>
          <CardDescription>Your assigned compliance tasks and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compliance Deadlines
          </CardTitle>
          <CardDescription>Your assigned compliance tasks and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (complianceDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compliance Deadlines
          </CardTitle>
          <CardDescription>Your assigned compliance tasks and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Compliance Tasks</h3>
            <p className="text-muted-foreground">
              You currently have no compliance deadlines assigned to you.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Compliance Deadlines
        </CardTitle>
        <CardDescription>
          You have {complianceDocuments.length} compliance task{complianceDocuments.length !== 1 ? 's' : ''} assigned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCompliance.map((compliance) => {
            const progress = calculateProgress(compliance);
            const daysUntilDue = getDaysUntilDue(compliance.dueDate);
            const relatedDoc = userDocuments.find((doc: Document) => doc.id === compliance.documentId);

            return (
              <div
                key={compliance.id}
                className={cn(
                  "p-4 rounded-lg border-l-4 bg-card",
                  compliance.status === 'overdue' && "border-l-red-500 bg-red-50/50",
                  compliance.status === 'due-soon' && "border-l-yellow-500 bg-yellow-50/50",
                  compliance.status === 'on-track' && "border-l-blue-500 bg-blue-50/50",
                  compliance.status === 'completed' && "border-l-green-500 bg-green-50/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{compliance.title}</h4>
                    {compliance.description && (
                      <p className="text-muted-foreground text-sm mb-2">{compliance.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDueDate(compliance.dueDate)}</span>
                      </div>
                      {daysUntilDue >= 0 ? (
                        <span className="text-muted-foreground">
                          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days remaining`}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          {Math.abs(daysUntilDue)} days overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={cn("flex items-center gap-1", getStatusColor(compliance.status))}>
                    {getStatusIcon(compliance.status)}
                    {compliance.status.charAt(0).toUpperCase() + compliance.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>

                {relatedDoc && relatedDoc.actionPoints && relatedDoc.actionPoints.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{progress}% complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {relatedDoc.actionPoints.filter((ap: any) => ap.isCompleted).length} of {relatedDoc.actionPoints.length} action points completed
                    </div>
                  </div>
                )}

                {compliance.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {compliance.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}