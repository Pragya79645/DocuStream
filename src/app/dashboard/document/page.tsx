'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Share
} from 'lucide-react';
import { Document, User as UserType, Category } from '@/lib/types';
import { listenToDocument } from '@/lib/client-services/documents.client.service';
import { getUsers } from '@/lib/services/users.service';
import { getCategories } from '@/lib/services/categories.service';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DocumentDetailPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('doc');
  
  const [document, setDocument] = useState<Document | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, categoriesData] = await Promise.all([
          getUsers(),
          getCategories()
        ]);
        setUsers(usersData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load supporting data');
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!docId) {
      setError('No document ID provided');
      setLoading(false);
      return;
    }

    const unsubscribe = listenToDocument(docId, (doc) => {
      setDocument(doc);
      setLoading(false);
      if (!doc) {
        setError('Document not found');
      }
    });

    return () => unsubscribe();
  }, [docId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || 'The requested document could not be found.'}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const uploader = users.find(u => u.id === document.uploaderId);
  const category = categories.find(c => c.id === document.categoryId);
  const affectedCategories = document.affectedDepartmentIds?.map(id => 
    categories.find(c => c.id === id)
  ).filter(Boolean) || [];

  const completedActions = document.actionPoints.filter(ap => ap.isCompleted).length;
  const totalActions = document.actionPoints.length;
  const completionPercentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-muted-foreground">{document.originalFilename}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document.fileUrl && (
            <Link href={document.fileUrl} target="_blank">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Type</label>
                  <p className="text-sm">{document.fileType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded</label>
                  <p className="text-sm">{format(parseISO(document.uploadedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Department</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <Badge variant="outline">{category?.name || 'Unknown'}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded By</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{uploader?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {document.affectedDepartmentIds && document.affectedDepartmentIds.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Affected Departments</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {affectedCategories.map(cat => (
                      <Badge key={cat?.id} variant="secondary">{cat?.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {document.crossDepartmentTags && document.crossDepartmentTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {document.crossDepartmentTags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {document.summary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Summary</label>
                  <p className="text-sm mt-1">{document.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Action Points
                </div>
                <div className="text-sm text-muted-foreground">
                  {completedActions} of {totalActions} completed ({completionPercentage}%)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {document.actionPoints.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No action points available</p>
              ) : (
                <div className="space-y-3">
                  {document.actionPoints.map((actionPoint, index) => (
                    <div key={actionPoint.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                        actionPoint.isCompleted 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "border-gray-300"
                      )}>
                        {actionPoint.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm",
                          actionPoint.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {actionPoint.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  document.status === 'processed' ? "bg-green-500" :
                  document.status === 'processing' ? "bg-yellow-500" :
                  "bg-red-500"
                )} />
                <span className="text-sm capitalize">{document.status || 'Unknown'}</span>
              </div>

              {document.priority && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    document.priority === 'high' ? "text-red-500" :
                    document.priority === 'medium' ? "text-yellow-500" :
                    "text-green-500"
                  )} />
                  <span className="text-sm capitalize">{document.priority} Priority</span>
                </div>
              )}

              {document.complianceDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Compliance Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(document.complianceDeadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Relevance */}
          {document.departmentRelevanceScore && Object.keys(document.departmentRelevanceScore).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Relevance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(document.departmentRelevanceScore).map(([deptId, score]) => {
                    const dept = categories.find(c => c.id === deptId);
                    return (
                      <div key={deptId} className="flex items-center justify-between">
                        <span className="text-sm">{dept?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(score * 100)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}