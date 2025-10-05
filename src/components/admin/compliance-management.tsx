'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Edit2, Trash2, Users, RefreshCw } from 'lucide-react';
import { ComplianceDocument, Category, User as AppUser, Document, ComplianceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ComplianceManagementProps {
  complianceDocuments: ComplianceDocument[];
  categories: Category[];
  users: AppUser[];
  documents: Document[];
  onCreateCompliance: (compliance: Omit<ComplianceDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateCompliance: (id: string, updates: Partial<ComplianceDocument>) => Promise<void>;
  onDeleteCompliance: (id: string) => Promise<void>;
}

interface ComplianceFormData {
  title: string;
  description: string;
  dueDate: string;
  categoryId: string;
  assignedToIds: string[];
  documentId: string;
  reminderDays: number;
  notes: string;
}

const initialFormData: ComplianceFormData = {
  title: '',
  description: '',
  dueDate: '',
  categoryId: '',
  assignedToIds: [],
  documentId: '',
  reminderDays: 7,
  notes: '',
};

export default function ComplianceManagement({
  complianceDocuments,
  categories,
  users,
  documents,
  onCreateCompliance,
  onUpdateCompliance,
  onDeleteCompliance,
}: ComplianceManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState<ComplianceDocument | null>(null);
  const [formData, setFormData] = useState<ComplianceFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Update compliance statuses when component mounts or when documents change
  useEffect(() => {
    const updateOutdatedStatuses = async () => {
      for (const compliance of complianceDocuments) {
        if (compliance.status !== 'completed') {
          const currentStatus = calculateCurrentStatus(compliance.dueDate, compliance.reminderDays, compliance.status, compliance.documentId);
          if (currentStatus !== compliance.status) {
            try {
              await onUpdateCompliance(compliance.id, { status: currentStatus });
            } catch (error) {
              console.error('Error updating compliance status:', error);
            }
          }
        }
      }
    };

    if (complianceDocuments.length > 0) {
      updateOutdatedStatuses();
    }
  }, [complianceDocuments, onUpdateCompliance]);

  // Calculate current status based on due date, reminder days, and action points completion
  const calculateCurrentStatus = (dueDate: string, reminderDays: number, currentStatus: string, documentId: string): ComplianceStatus => {
    // If already completed and marked as such, keep as completed
    if (currentStatus === 'completed') {
      return currentStatus as ComplianceStatus;
    }

    // Find the related document and check action points
    const relatedDocument = documents.find(doc => doc.id === documentId);
    const hasActionPoints = relatedDocument?.actionPoints && relatedDocument.actionPoints.length > 0;
    const allActionPointsCompleted = hasActionPoints && 
      relatedDocument.actionPoints.every(point => point.isCompleted);

    // If all action points are completed, mark as completed
    if (allActionPointsCompleted) {
      return 'completed';
    }

    // Otherwise, calculate based on due date
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= reminderDays) {
      return 'due-soon';
    } else {
      return 'on-track';
    }
  };

  // Get action points completion info for a document
  const getActionPointsInfo = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document?.actionPoints || document.actionPoints.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    
    const total = document.actionPoints.length;
    const completed = document.actionPoints.filter(point => point.isCompleted).length;
    const percentage = Math.round((completed / total) * 100);
    
    return { total, completed, percentage };
  };

  // Filter compliance documents to only show those linked to actual uploaded documents
  const validComplianceDocuments = complianceDocuments.filter(compliance => {
    // Only show compliance documents that are linked to actual uploaded documents
    const relatedDocument = documents.find(doc => doc.id === compliance.documentId);
    return relatedDocument && relatedDocument.fileUrl; // Ensure document exists and has been uploaded
  }).map(compliance => ({
    ...compliance,
    // Update status based on current date and action points completion
    status: calculateCurrentStatus(compliance.dueDate, compliance.reminderDays, compliance.status, compliance.documentId)
  }));

  const filteredCompliance = validComplianceDocuments.filter(compliance => {
    if (searchTerm.trim() === '') {
      const matchesStatus = statusFilter === 'all' || compliance.status === statusFilter;
      return matchesStatus;
    }

    const searchLower = searchTerm.toLowerCase();
    
    // Search in compliance title and description
    const matchesCompliance = compliance.title.toLowerCase().includes(searchLower) ||
                             compliance.description?.toLowerCase().includes(searchLower) ||
                             compliance.notes?.toLowerCase().includes(searchLower);
    
    // Search in related document title
    const relatedDocument = documents.find(doc => doc.id === compliance.documentId);
    const matchesDocument = relatedDocument?.title.toLowerCase().includes(searchLower) ||
                           relatedDocument?.originalFilename.toLowerCase().includes(searchLower);
    
    // Search in category name
    const categoryName = getCategoryName(compliance.categoryId);
    const matchesCategory = categoryName.toLowerCase().includes(searchLower);
    
    // Search in assigned user names
    const assignedUserNames = getUserNames(compliance.assignedToIds);
    const matchesUsers = assignedUserNames.toLowerCase().includes(searchLower);
    
    // Search in document ID (partial match)
    const matchesDocumentId = compliance.documentId.toLowerCase().includes(searchLower);
    
    const matchesSearch = matchesCompliance || matchesDocument || matchesCategory || 
                         matchesUsers || matchesDocumentId;
    const matchesStatus = statusFilter === 'all' || compliance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get uploaded documents that don't have compliance tracking yet (only real uploaded documents)
  const documentsWithoutCompliance = documents.filter(doc => 
    doc.fileUrl && // Only include documents that have been actually uploaded
    !complianceDocuments.some(compliance => compliance.documentId === doc.id)
  );

  const handleCreateComplianceForDocument = (document: Document) => {
    setFormData({
      ...initialFormData,
      title: `Compliance for ${document.title}`,
      description: `Compliance requirements for the uploaded document: ${document.title}`,
      documentId: document.id,
      categoryId: document.categoryId,
    });
    setIsCreateDialogOpen(true);
  };

  const handleRefreshStatuses = async () => {
    setIsSubmitting(true);
    try {
      for (const compliance of complianceDocuments) {
        if (compliance.status !== 'completed') {
          const currentStatus = calculateCurrentStatus(compliance.dueDate, compliance.reminderDays, compliance.status, compliance.documentId);
          if (currentStatus !== compliance.status) {
            await onUpdateCompliance(compliance.id, { status: currentStatus });
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing statuses:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);

    try {
      await onCreateCompliance({
        ...formData,
        status: 'on-track',
      });
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating compliance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompliance) return;

    setIsSubmitting(true);

    try {
      await onUpdateCompliance(editingCompliance.id, formData);
      setEditingCompliance(null);
      setIsEditDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error updating compliance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (compliance: ComplianceDocument) => {
    setEditingCompliance(compliance);
    setFormData({
      title: compliance.title,
      description: compliance.description || '',
      dueDate: compliance.dueDate.split('T')[0], // Convert to YYYY-MM-DD format
      categoryId: compliance.categoryId,
      assignedToIds: compliance.assignedToIds,
      documentId: compliance.documentId,
      reminderDays: compliance.reminderDays,
      notes: compliance.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this compliance document?')) {
      try {
        await onDeleteCompliance(id);
      } catch (error) {
        console.error('Error deleting compliance:', error);
      }
    }
  };

  const getCategoryName = (categoryId: string): string => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getDocumentTitle = (documentId: string): string => {
    return documents.find(doc => doc.id === documentId)?.title || 'Unknown Document';
  };

  const getUserNames = (userIds: string[]): string => {
    const selectedUsers = users.filter(user => userIds.includes(user.id));
    return selectedUsers.map(user => user.name).join(', ') || 'Unassigned';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'due-soon': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ComplianceForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter compliance title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter compliance description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentId">Related Document</Label>
          <Select
            value={formData.documentId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, documentId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((document) => (
                <SelectItem key={document.id} value={document.id}>
                  {document.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reminderDays">Reminder Days</Label>
          <Input
            id="reminderDays"
            type="number"
            min="1"
            max="365"
            value={formData.reminderDays}
            onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 7 }))}
            placeholder="Days before due date to show warning"
          />
        </div>

        <div className="space-y-2">
          <Label>Assigned Users</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
            {users.map((user) => (
              <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.assignedToIds.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        assignedToIds: [...prev.assignedToIds, user.id]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        assignedToIds: prev.assignedToIds.filter(id => id !== user.id)
                      }));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{user.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes or instructions"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Documents without compliance tracking */}
      {documentsWithoutCompliance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents Needing Compliance Tracking</CardTitle>
            <CardDescription>
              These uploaded documents don't have compliance requirements assigned yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentsWithoutCompliance.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{document.title}</h4>
                    <p className="text-xs text-gray-500">
                      Uploaded {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Category: {getCategoryName(document.categoryId)}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleCreateComplianceForDocument(document)}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Compliance
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Compliance Requirements for Uploaded Documents</CardTitle>
              <CardDescription>
                Track compliance requirements, deadlines, and assignments for your uploaded documents
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatuses}
                disabled={isSubmitting}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isSubmitting ? 'animate-spin' : ''}`} />
                {isSubmitting ? 'Updating...' : 'Refresh Status'}
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Compliance</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Compliance Document</DialogTitle>
                    <DialogDescription>
                      Add a new regulatory compliance requirement with due dates and assignments.
                    </DialogDescription>
                  </DialogHeader>
                  <ComplianceForm onSubmit={handleCreateSubmit} submitLabel="Create Compliance" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search compliance documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="due-soon">Due Soon</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compliance Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Related Document</TableHead>
                  <TableHead>Action Points</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompliance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {documentsWithoutCompliance.length > 0 
                        ? "No compliance requirements set up yet. Add compliance tracking to your uploaded documents above."
                        : "No compliance documents found. Upload documents first, then add compliance requirements."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompliance.map((compliance) => (
                    <TableRow key={compliance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{compliance.title}</div>
                          {compliance.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {compliance.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{getDocumentTitle(compliance.documentId)}</div>
                          <div className="text-gray-500 text-xs">
                            Document ID: {compliance.documentId.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const actionInfo = getActionPointsInfo(compliance.documentId);
                          if (actionInfo.total === 0) {
                            return (
                              <div className="text-sm text-gray-500">
                                No action points
                              </div>
                            );
                          }
                          return (
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  actionInfo.percentage === 100 
                                    ? 'bg-green-100 text-green-800' 
                                    : actionInfo.percentage > 50 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {actionInfo.completed}/{actionInfo.total}
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    actionInfo.percentage === 100 
                                      ? 'bg-green-500' 
                                      : actionInfo.percentage > 50 
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${actionInfo.percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                {actionInfo.percentage === 100 ? 'All completed' : `${actionInfo.percentage}% complete`}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{getCategoryName(compliance.categoryId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(compliance.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', getStatusColor(compliance.status))}>
                          {compliance.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getUserNames(compliance.assignedToIds)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(compliance)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(compliance.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Compliance Document</DialogTitle>
            <DialogDescription>
              Update the compliance document details and assignments.
            </DialogDescription>
          </DialogHeader>
          <ComplianceForm onSubmit={handleEditSubmit} submitLabel="Update Compliance" />
        </DialogContent>
      </Dialog>
    </div>
  );
}