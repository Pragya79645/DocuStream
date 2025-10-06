'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/user-management';
import { CategoryManagement } from '@/components/admin/category-management';
import { DocumentManagement } from '@/components/admin/document-management';
import { ReportingAnalytics } from '@/components/admin/reporting-analytics';
import AdminComplianceWrapper from '@/components/admin/admin-compliance-wrapper';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

function AdminPageComponent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'users';
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== 'admin') {
    // Redirect non-admin users or show an unauthorized message
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    // Return a loading/unauthorized message while redirecting
    return (
        <div className="py-4">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p>You do not have permission to view this page. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold font-headline mb-4">Admin Dashboard</h1>
      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Invite, edit, and manage user permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Add, edit, or remove document categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                View and manage all documents across the organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <DocumentManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Management</CardTitle>
              <CardDescription>
                Manage regulatory compliance documents, deadlines, and assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminComplianceWrapper />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reporting & Analytics</CardTitle>
              <CardDescription>
                Overview of system usage and document lifecycle.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <ReportingAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageComponent />
        </Suspense>
    )
}
