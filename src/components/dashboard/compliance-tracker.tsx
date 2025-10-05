'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Building } from 'lucide-react';
import { ComplianceDocument, ComplianceStatus, Category, User as AppUser } from '@/lib/types';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface ComplianceTrackerProps {
  complianceDocuments: ComplianceDocument[];
  categories: Category[];
  users: AppUser[];
  onMarkCompleted?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showAll?: boolean;
}

const getStatusColor = (status: ComplianceStatus): string => {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'due-soon':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: ComplianceStatus) => {
  switch (status) {
    case 'on-track':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'due-soon':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-gray-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getDaysUntilDue = (dueDate: string): number => {
  return differenceInDays(new Date(dueDate), new Date());
};

const formatDueDate = (dueDate: string): string => {
  return format(new Date(dueDate), 'MMM dd, yyyy');
};

export default function ComplianceTracker({
  complianceDocuments,
  categories,
  users,
  onMarkCompleted,
  onViewDetails,
  showAll = false,
}: ComplianceTrackerProps) {
  const [filteredDocuments, setFilteredDocuments] = useState<ComplianceDocument[]>([]);
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'status' | 'title'>('dueDate');

  useEffect(() => {
    let filtered = showAll 
      ? complianceDocuments 
      : complianceDocuments.filter(doc => doc.status !== 'completed');

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'status':
          const statusOrder = { 'overdue': 0, 'due-soon': 1, 'on-track': 2, 'completed': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [complianceDocuments, statusFilter, sortBy, showAll]);

  const getCategoryName = (categoryId: string): string => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getAssignedUserNames = (userIds: string[]): string => {
    const assignedUsers = users.filter(user => userIds.includes(user.id));
    return assignedUsers.map(user => user.name).join(', ') || 'Unassigned';
  };

  const getStatusCounts = () => {
    return {
      'on-track': complianceDocuments.filter(doc => doc.status === 'on-track').length,
      'due-soon': complianceDocuments.filter(doc => doc.status === 'due-soon').length,
      'overdue': complianceDocuments.filter(doc => doc.status === 'overdue').length,
      'completed': complianceDocuments.filter(doc => doc.status === 'completed').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">On Track</p>
                <p className="text-2xl font-bold text-green-900">{statusCounts['on-track']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-900">{statusCounts['due-soon']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{statusCounts['overdue']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts['completed']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Documents</CardTitle>
          <CardDescription>
            Track regulatory documents and their compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ComplianceStatus | 'all')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="on-track">On Track</option>
                <option value="due-soon">Due Soon</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-by" className="text-sm font-medium">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'status' | 'title')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No compliance documents found matching the current filters.
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const daysUntilDue = getDaysUntilDue(doc.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= doc.reminderDays;

                return (
                  <Card 
                    key={doc.id} 
                    className={cn(
                      "border-l-4 transition-all hover:shadow-md",
                      doc.status === 'overdue' && "border-l-red-500",
                      doc.status === 'due-soon' && "border-l-yellow-500", 
                      doc.status === 'on-track' && "border-l-green-500",
                      doc.status === 'completed' && "border-l-gray-500"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{doc.title}</h3>
                              {doc.description && (
                                <p className="text-gray-600 text-sm mt-1">{doc.description}</p>
                              )}
                              
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Due: {formatDueDate(doc.dueDate)}</span>
                                  {isOverdue && (
                                    <span className="text-red-600 font-medium">
                                      ({Math.abs(daysUntilDue)} days overdue)
                                    </span>
                                  )}
                                  {isDueSoon && !isOverdue && (
                                    <span className="text-yellow-600 font-medium">
                                      ({daysUntilDue} days remaining)
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Building className="h-4 w-4" />
                                  <span>{getCategoryName(doc.categoryId)}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{getAssignedUserNames(doc.assignedToIds)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={cn("flex items-center space-x-1", getStatusColor(doc.status))}>
                            {getStatusIcon(doc.status)}
                            <span className="capitalize">{doc.status.replace('-', ' ')}</span>
                          </Badge>
                          
                          <div className="flex space-x-2">
                            {onViewDetails && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(doc.id)}
                              >
                                View Details
                              </Button>
                            )}
                            
                            {doc.status !== 'completed' && onMarkCompleted && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onMarkCompleted(doc.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {doc.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{doc.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}