'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Building2,
  ArrowUpRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { SharedAwarenessItem, Category } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SharedAwarenessDashboardProps {
  userDepartmentIds: string[];
  categories: Category[];
}

interface CrossDepartmentStats {
  totalDocuments: number;
  totalCompliance: number;
  highPriorityItems: number;
  coordinationRequired: number;
}

export function SharedAwarenessDashboard({ userDepartmentIds, categories }: SharedAwarenessDashboardProps) {
  const [sharedItems, setSharedItems] = useState<SharedAwarenessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [stats, setStats] = useState<CrossDepartmentStats>({
    totalDocuments: 0,
    totalCompliance: 0,
    highPriorityItems: 0,
    coordinationRequired: 0
  });

  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

  useEffect(() => {
    fetchSharedAwarenessData();
    
    // Set up periodic refresh every 30 seconds to catch compliance updates
    const interval = setInterval(() => {
      fetchSharedAwarenessData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [userDepartmentIds]);

  const fetchSharedAwarenessData = async () => {
    if (userDepartmentIds.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const departmentIdsParam = userDepartmentIds.join(',');
      
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = new Date().getTime();
      
      // Fetch both documents and compliance items
      const [documentsResponse, complianceResponse] = await Promise.all([
        fetch(`/api/cross-department?action=shared-awareness&departmentIds=${departmentIdsParam}&_t=${timestamp}`, {
          cache: 'no-cache'
        }),
        fetch(`/api/compliance?action=shared-awareness&departmentIds=${departmentIdsParam}&_t=${timestamp}`, {
          cache: 'no-cache'
        })
      ]);

      if (!documentsResponse.ok || !complianceResponse.ok) {
        throw new Error('Failed to fetch shared awareness data');
      }

      const [documents, compliance] = await Promise.all([
        documentsResponse.json(),
        complianceResponse.json()
      ]);

      const allItems = [...documents, ...compliance];
      setSharedItems(allItems);
      
      // Calculate stats
      const docCount = allItems.filter(item => item.type === 'document').length;
      const compCount = allItems.filter(item => item.type === 'compliance').length;
      const highPriorityCount = allItems.filter(item => item.priority === 'high').length;
      const coordinationCount = allItems.filter(item => 
        item.tags.includes('coordination-required') || item.affectedDepartments.length > 1
      ).length;
      
      setStats({
        totalDocuments: docCount,
        totalCompliance: compCount,
        highPriorityItems: highPriorityCount,
        coordinationRequired: coordinationCount
      });
      
    } catch (err) {
      console.error('Error fetching shared awareness data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shared awareness data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = sharedItems;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }
    
    return filtered;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (userDepartmentIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared Awareness Dashboard
          </CardTitle>
          <CardDescription>Cross-department documents and compliance items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No departments assigned. Contact your administrator to access shared awareness data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared Awareness Dashboard
          </CardTitle>
          <CardDescription>Cross-department documents and compliance items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shared awareness data...</p>
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
            <Users className="h-5 w-5" />
            Shared Awareness Dashboard
          </CardTitle>
          <CardDescription>Cross-department documents and compliance items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchSharedAwarenessData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">Cross-Dept Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCompliance}</p>
                <p className="text-xs text-muted-foreground">Compliance Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.highPriorityItems}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.coordinationRequired}</p>
                <p className="text-xs text-muted-foreground">Need Coordination</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Shared Awareness Dashboard
              </CardTitle>
              <CardDescription>
                Documents and compliance items affecting multiple departments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <Button onClick={fetchSharedAwarenessData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Items ({sharedItems.length})</TabsTrigger>
              <TabsTrigger value="document">Documents ({stats.totalDocuments})</TabsTrigger>
              <TabsTrigger value="compliance">Compliance ({stats.totalCompliance})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No shared awareness items found for your departments.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Primary Dept</TableHead>
                        <TableHead>Affected Depts</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={`${item.type}-${item.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.type === 'document' ? (
                                <FileText className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Calendar className="h-4 w-4 text-purple-500" />
                              )}
                              <span className="capitalize text-sm">{item.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={item.href} className="hover:underline">
                              <div 
                                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                title="Click to open document"
                              >
                                {item.title}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.primaryDepartment}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.affectedDepartments.slice(0, 2).map((dept) => (
                                <Badge key={dept} variant="secondary" className="text-xs">
                                  {dept}
                                </Badge>
                              ))}
                              {item.affectedDepartments.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.affectedDepartments.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(item.priority)}
                              <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                                {item.priority}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.dueDate ? (
                              <div className="text-sm">
                                {format(parseISO(item.dueDate), 'MMM dd, yyyy')}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No due date</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 4 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-help" 
                                  title={`Additional tags: ${item.tags.slice(4).join(', ')}`}
                                >
                                  +{item.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={item.href}>
                              <Button variant="outline" size="sm" className="h-8">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}