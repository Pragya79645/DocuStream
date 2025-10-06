'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ComplianceTracker from '@/components/dashboard/compliance-tracker';
import { ComplianceDocument, Category, User, Document } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Clock, CheckCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComplianceClientService, listenToComplianceForUser } from '@/lib/client-services/compliance.client.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { getAllDocuments } from '@/lib/services/documents.service';

export default function CompliancePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    categoryId: '',
    reminderDays: 7,
  });

  useEffect(() => {
    async function fetchInitialData() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Fetch static data that doesn't need real-time updates
        const [categoriesData, usersData, documentsData] = await Promise.all([
          getCategories(),
          getUsers(),
          getAllDocuments()
        ]);

        setCategories(categoriesData);
        setUsers(usersData);
        setDocuments(documentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load initial data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, currentUser, toast]);

  // Real-time listener for compliance documents
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = listenToComplianceForUser(
      currentUser.id,
      currentUser.categoryIds,
      (docs) => {
        setComplianceDocuments(docs);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkCompleted = async (id: string) => {
    try {
      await ComplianceClientService.markComplianceCompleted(id);
      
      // Update local state
      setComplianceDocuments(prev => 
        prev.map(doc => 
          doc.id === id 
            ? { ...doc, status: 'completed' as const, completedAt: new Date().toISOString() }
            : doc
        )
      );
      
      toast({
        title: 'Success',
        description: 'Compliance document marked as completed',
      });
    } catch (error) {
      console.error('Error marking compliance as completed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update compliance status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (id: string) => {
    // TODO: Implement navigation to detailed view or open modal
    console.log('View details for compliance:', id);
  };

  const handleCreateCompliance = async () => {
    if (!currentUser || !formData.title || !formData.categoryId || !formData.dueDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newComplianceData = {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        categoryId: formData.categoryId,
        assignedToIds: [currentUser.id], // Assign to current user by default
        documentId: '', // Will be linked later if needed
        reminderDays: formData.reminderDays,
        status: 'on-track' as const,
      };

      const id = await ComplianceClientService.createCompliance(newComplianceData);
      
      // Add to local state
      const newCompliance: ComplianceDocument = {
        id,
        ...newComplianceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setComplianceDocuments(prev => [...prev, newCompliance]);
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        categoryId: '',
        reminderDays: 7,
      });

      toast({
        title: 'Success',
        description: 'Compliance document created successfully',
      });
    } catch (error) {
      console.error('Error creating compliance:', error);
      toast({
        title: 'Error',
        description: 'Failed to create compliance document',
        variant: 'destructive',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <div>You must be logged in to view this page.</div>;
  }

  // Filter compliance documents for current user's categories or assigned to them
  const userComplianceDocuments = complianceDocuments.filter(doc => 
    currentUser.categoryIds.includes(doc.categoryId) || 
    doc.assignedToIds.includes(currentUser.id)
  );

  const getStatusCounts = () => {
    return {
      'on-track': userComplianceDocuments.filter(doc => doc.status === 'on-track').length,
      'due-soon': userComplianceDocuments.filter(doc => doc.status === 'due-soon').length,
      'overdue': userComplianceDocuments.filter(doc => doc.status === 'overdue').length,
      'completed': userComplianceDocuments.filter(doc => doc.status === 'completed').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Compliance Tracker</h1>
          <p className="text-muted-foreground">
            Track regulatory documents and compliance deadlines for your departments
          </p>
        </div>
        {currentUser.role === 'admin' && (
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter compliance title" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter description" 
                    rows={3} 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
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
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCompliance}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Stats */}
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

      {/* Compliance Tracker Component */}
      <ComplianceTracker
        complianceDocuments={userComplianceDocuments}
        categories={categories}
        users={users}
        onMarkCompleted={handleMarkCompleted}
        onViewDetails={handleViewDetails}
        showAll={false}
      />
      
      {userComplianceDocuments.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-10">
            <h3 className="text-xl font-semibold">No compliance documents found</h3>
            <p className="text-muted-foreground">
              No compliance documents are assigned to your departments or to you directly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}