'use client';

import React, { useState, useEffect } from 'react';
import ComplianceManagement from '@/components/admin/compliance-management';
import { ComplianceDocument, Category, User, Document } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplianceClientService, listenToAllCompliance } from '@/lib/client-services/compliance.client.service';
import { getCategories } from '@/lib/services/categories.service';
import { getUsers } from '@/lib/services/users.service';
import { getAllDocuments } from '@/lib/services/documents.service';

export default function AdminComplianceWrapper() {
  const { toast } = useToast();
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaticData();
  }, []);

  // Real-time listener for compliance documents
  useEffect(() => {
    const unsubscribe = listenToAllCompliance((docs) => {
      setComplianceDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchStaticData = async () => {
    setLoading(true);
    try {
      const [categoriesData, usersData, documentsData] = await Promise.all([
        getCategories(),
        getUsers(),
        getAllDocuments()
      ]);

      setCategories(categoriesData);
      setUsers(usersData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching static data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load static data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleCreateCompliance = async (
    complianceData: Omit<ComplianceDocument, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const id = await ComplianceClientService.createCompliance(complianceData);
      
      const newCompliance: ComplianceDocument = {
        id,
        ...complianceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setComplianceDocuments(prev => [...prev, newCompliance]);
      
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
      throw error;
    }
  };

  const handleUpdateCompliance = async (
    id: string, 
    updates: Partial<ComplianceDocument>
  ) => {
    try {
      await ComplianceClientService.updateCompliance(id, updates);
      
      setComplianceDocuments(prev =>
        prev.map(doc => doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc)
      );
      
      toast({
        title: 'Success',
        description: 'Compliance document updated successfully',
      });
    } catch (error) {
      console.error('Error updating compliance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update compliance document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteCompliance = async (id: string) => {
    try {
      await ComplianceClientService.deleteCompliance(id);
      
      setComplianceDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: 'Success',
        description: 'Compliance document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting compliance:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete compliance document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will create sample compliance documents. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/seed-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'seed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to seed compliance data');
      }

      toast({
        title: 'Success',
        description: 'Compliance data seeded successfully',
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed compliance data',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm('This will delete ALL compliance documents. This action cannot be undone. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/seed-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear compliance data');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear compliance data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control buttons */}
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex gap-2">
          {complianceDocuments.length > 0 && (
            <Button onClick={handleClearData} variant="outline" className="text-red-600 hover:text-red-800">
              Clear All Compliance Data
            </Button>
          )}
          {complianceDocuments.length === 0 && (
            <Button onClick={handleSeedData} variant="outline">
              Create Sample Data
            </Button>
          )}
        </div>
      </div>

      {/* No compliance documents message */}
      {complianceDocuments.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Compliance Documents Found</h3>
          <p className="text-gray-600 mb-4">
            Upload some documents first, then add compliance requirements to track deadlines and assignments.
          </p>
        </div>
      )}
      
      <ComplianceManagement
        complianceDocuments={complianceDocuments}
        categories={categories}
        users={users}
        documents={documents}
        onCreateCompliance={handleCreateCompliance}
        onUpdateCompliance={handleUpdateCompliance}
        onDeleteCompliance={handleDeleteCompliance}
      />
    </div>
  );
}