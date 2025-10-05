'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe,
  FileText, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Building2,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Users,
  Bell,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Category } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CrossDepartmentFeedProps {
  categories: Category[];
}

interface FeedDocument {
  id: string;
  title: string;
  originalFilename: string;
  department: string;
  departmentId: string;
  uploadedAt: string;
  uploaderId: string;
  fileType: string;
  priority: 'high' | 'medium' | 'low';
  summary?: string;
  href: string;
  affectedDepartments: string[];
  crossDepartmentTags: string[];
  isComplianceRelated: boolean;
  complianceDeadline?: string;
  status?: 'processing' | 'processed' | 'failed';
}

interface FeedStats {
  totalDocuments: number;
  highPriorityDocs: number;
  affectedDepartments: number;
  recentUploads: number;
}

export function CrossDepartmentFeed({ categories }: CrossDepartmentFeedProps) {
  const [documents, setDocuments] = useState<FeedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [stats, setStats] = useState<FeedStats>({
    totalDocuments: 0,
    highPriorityDocs: 0,
    affectedDepartments: 0,
    recentUploads: 0
  });

  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all uploaded documents from all departments
      const response = await fetch('/api/documents/feed');

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const documentsData = await response.json();
      setDocuments(documentsData);

      // Calculate stats
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentDocs = documentsData.filter((doc: FeedDocument) => 
        new Date(doc.uploadedAt) > yesterday
      );

      const uniqueDepartments = new Set();
      documentsData.forEach((doc: FeedDocument) => {
        uniqueDepartments.add(doc.department);
        doc.affectedDepartments.forEach(dept => uniqueDepartments.add(dept));
      });

      setStats({
        totalDocuments: documentsData.length,
        highPriorityDocs: documentsData.filter((doc: FeedDocument) => doc.priority === 'high').length,
        affectedDepartments: uniqueDepartments.size,
        recentUploads: recentDocs.length
      });

    } catch (error) {
      console.error('Error fetching documents feed:', error);
      setError('Failed to load documents feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      fetchFeedData();
    }
  }, [categories]);

  const filteredDocuments = documents.filter(doc => {
    // Priority filter
    if (priorityFilter !== 'all' && doc.priority !== priorityFilter) {
      return false;
    }

    // Department filter
    if (departmentFilter !== 'all') {
      const matchesPrimary = doc.departmentId === departmentFilter;
      const matchesAffected = doc.affectedDepartments.some(dept => 
        categoryMap.get(departmentFilter) === dept
      );
      if (!matchesPrimary && !matchesAffected) {
        return false;
      }
    }

    // File type filter
    if (fileTypeFilter !== 'all' && doc.fileType !== fileTypeFilter) {
      return false;
    }

    return true;
  });

  // Get unique file types for filter
  const uniqueFileTypes = [...new Set(documents.map(doc => doc.fileType))].sort();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      if (!isValid(date)) return 'Unknown';
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Unknown';
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    try {
      const date = parseISO(dueDate);
      if (!isValid(date)) return null;
      const now = new Date();
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      } else if (diffDays === 0) {
        return <Badge variant="destructive" className="text-xs">Due Today</Badge>;
      } else if (diffDays <= 3) {
        return <Badge variant="outline" className="text-xs text-orange-600">Due in {diffDays} days</Badge>;
      } else {
        return <Badge variant="outline" className="text-xs">Due {format(date, 'MMM dd')}</Badge>;
      }
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading cross-department feed...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchFeedData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Cross-Department Feed
          </h1>
          <p className="text-muted-foreground">
            Stay informed about all departmental updates and activities
          </p>
        </div>
        <Button onClick={fetchFeedData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.affectedDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Departments</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* File Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File Type</label>
              <select 
                value={fileTypeFilter} 
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueFileTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Uploaded Documents
          </CardTitle>
          <CardDescription>
            Complete feed of all documents uploaded across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {getPriorityIcon(doc.priority)}
                            <Link 
                              href={doc.href}
                              className="font-medium hover:underline flex items-center gap-1"
                            >
                              {doc.title}
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {doc.originalFilename} • Uploaded to {doc.department}
                          </p>
                          
                          {doc.summary && (
                            <p className="text-sm text-muted-foreground italic">
                              {doc.summary.length > 150 ? `${doc.summary.substring(0, 150)}...` : doc.summary}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span>{doc.department}</span>
                            {doc.affectedDepartments.length > 0 && (
                              <>
                                <span>→</span>
                                <span>{doc.affectedDepartments.join(', ')}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {doc.fileType.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={doc.priority === 'high' ? 'destructive' : 'secondary'} 
                              className="text-xs"
                            >
                              {doc.priority}
                            </Badge>
                            {doc.isComplianceRelated && (
                              <Badge variant="outline" className="text-xs">
                                Compliance
                              </Badge>
                            )}
                            {doc.status === 'processing' && (
                              <Badge variant="outline" className="text-xs text-orange-600">
                                Processing
                              </Badge>
                            )}
                            {doc.crossDepartmentTags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {formatDueDate(doc.complianceDeadline)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(doc.uploadedAt)}
                          </div>
                          {doc.status && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {doc.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}