import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Users, Crown, Briefcase, FileText, Eye, EyeOff } from 'lucide-react';
import { isDocumentVisibleToUser } from '@/lib/utils/document-targeting-utils';

// docuStream demo component for document targeting visibility
const mockUsers: Array<{
  id: string;
  name: string;
  categoryIds: string[];
  departmentRoles?: { [departmentId: string]: { roleTitle: string; roleLevel: string } };
}> = [
  {
    id: '1',
    name: 'Anoop Menon - Operations Director',
    categoryIds: ['ops', 'safety'],
    departmentRoles: {
      'ops': { roleTitle: 'Operations Director', roleLevel: 'executive' },
      'safety': { roleTitle: 'Safety Commissioner', roleLevel: 'executive' }
    }
  },
  {
    id: '2',
    name: 'Rajesh Kumar - Senior Engineer',
    categoryIds: ['eng'],
    departmentRoles: {
      'eng': { roleTitle: 'Senior Engineer', roleLevel: 'senior' }
    }
  },
  {
    id: '3',
    name: 'John Smith - Engineering Team Member',
    categoryIds: ['eng']
    // No departmentRoles - regular team member
  },
  {
    id: '4',
    name: 'Priya Nair - Finance Manager',
    categoryIds: ['fin'],
    departmentRoles: {
      'fin': { roleTitle: 'Finance Manager', roleLevel: 'management' }
    }
  },
  {
    id: '5',
    name: 'Sarah Wilson - Finance Team Member',
    categoryIds: ['fin']
    // No departmentRoles - regular team member
  }
];

// Mock documents that match the Document type structure
const mockDocuments = [
  {
    id: '1',
    title: 'All Engineering Team Safety Training',
    originalFilename: 'safety_training.pdf',
    fileType: 'PDF',
    uploadedAt: '2024-01-01T00:00:00Z',
    uploaderId: 'admin',
    categoryId: 'eng',
    targetingType: 'department' as const,
    actionPoints: [],
    status: 'processed' as const,
    description: 'Department-wide document for all engineering team members'
  },
  {
    id: '2',
    title: 'Senior Engineer Performance Review Guidelines',
    originalFilename: 'senior_performance.pdf',
    fileType: 'PDF',
    uploadedAt: '2024-01-01T00:00:00Z',
    uploaderId: 'admin',
    categoryId: 'eng',
    targetingType: 'role' as const,
    roleClassification: {
      departmentId: 'eng',
      roleTitle: 'Senior Engineer',
      roleLevel: 'senior' as const,
      confidence: 0.95
    },
    actionPoints: [],
    status: 'processed' as const,
    description: 'Role-specific document only for Senior Engineers'
  },
  {
    id: '3',
    title: 'Executive Budget Approval - Engineering',
    originalFilename: 'exec_budget.pdf',
    fileType: 'PDF',
    uploadedAt: '2024-01-01T00:00:00Z',
    uploaderId: 'admin',
    categoryId: 'eng',
    targetingType: 'role' as const,
    roleClassification: {
      departmentId: 'eng',
      roleTitle: 'Engineering Director',
      roleLevel: 'executive' as const,
      confidence: 0.9
    },
    actionPoints: [],
    status: 'processed' as const,
    description: 'Executive-level document (no Engineering Director in our demo users)'
  },
  {
    id: '4',
    title: 'Finance Department Monthly Report',
    originalFilename: 'finance_report.pdf',
    fileType: 'PDF',
    uploadedAt: '2024-01-01T00:00:00Z',
    uploaderId: 'admin',
    categoryId: 'fin',
    targetingType: 'department' as const,
    actionPoints: [],
    status: 'processed' as const,
    description: 'Department-wide document for all finance team members'
  },
  {
    id: '5',
    title: 'Management Budget Review',
    originalFilename: 'mgmt_budget.pdf',
    fileType: 'PDF',
    uploadedAt: '2024-01-01T00:00:00Z',
    uploaderId: 'admin',
    categoryId: 'fin',
    targetingType: 'role' as const,
    roleClassification: {
      departmentId: 'fin',
      roleTitle: 'Finance Manager',
      roleLevel: 'management' as const,
      confidence: 0.88
    },
    actionPoints: [],
    status: 'processed' as const,
    description: 'Management-level document only for Finance Manager'
  }
];

export function DocumentTargetingVisibilityDemo() {
  const [selectedDocument, setSelectedDocument] = useState(mockDocuments[0]);

  const getRoleIcon = (roleLevel?: string) => {
    switch (roleLevel) {
      case 'executive': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'management': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'senior': return <User className="w-4 h-4 text-green-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTargetingBadge = (doc: typeof mockDocuments[0]) => {
    if (doc.targetingType === 'department') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Users className="w-3 h-3 mr-1" />
          Department-wide
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          {getRoleIcon(doc.roleClassification?.roleLevel)}
          <span className="ml-1">{doc.roleClassification?.roleTitle}</span>
        </Badge>
      );
    }
  };

  const getDepartmentName = (categoryId: string) => {
    const departments: { [key: string]: string } = {
      'eng': 'Engineering',
      'fin': 'Finance',
      'ops': 'Operations',
      'safety': 'Safety'
    };
    return departments[categoryId] || categoryId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            docuStream Document Targeting Visibility Demo
          </CardTitle>
          <CardDescription>
            See exactly how documents are targeted and who can see them based on their roles in docuStream.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Select a Document</h3>
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedDocument.id === doc.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{doc.title}</h4>
                          {getTargetingBadge(doc)}
                        </div>
                        <p className="text-xs text-muted-foreground">{doc.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Department: {getDepartmentName(doc.categoryId)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Visibility Results */}
            <div className="space-y-4">
              <h3 className="font-semibold">Who Can See This Document?</h3>
              <div className="space-y-3">
                {mockUsers.map((user) => {
                  const canSee = isDocumentVisibleToUser(selectedDocument, user);
                  const userDepartmentRole = user.departmentRoles?.[selectedDocument.categoryId as keyof typeof user.departmentRoles];
                  
                  return (
                    <Card key={user.id} className={canSee ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {canSee ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium text-sm">{user.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {userDepartmentRole ? (
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(userDepartmentRole.roleLevel)}
                                  <span>{userDepartmentRole.roleTitle} ({userDepartmentRole.roleLevel})</span>
                                </div>
                              ) : (
                                <span>Regular team member</span>
                              )}
                            </div>
                          </div>
                          <Badge variant={canSee ? 'default' : 'secondary'} className="text-xs">
                            {canSee ? 'Can See' : 'Cannot See'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How Document Targeting Works in docuStream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Department-wide Documents
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                These documents are visible to <strong>ALL members</strong> of the department, including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Regular team members</li>
                <li>• Senior staff</li>
                <li>• Managers</li>
                <li>• Executives/Directors</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Role-specific Documents
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                These documents are visible <strong>ONLY</strong> to users with the matching role:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Must have the exact role title OR role level</li>
                <li>• Must be in the target department</li>
                <li>• Regular team members cannot see executive/management documents</li>
                <li>• Executives can only see documents specifically for their role level</li>
              </ul>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">Examples:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Department-wide:</strong> "All Engineering Team Safety Training" → Everyone in Engineering sees it</li>
                <li><strong>Role-specific:</strong> "Executive Budget Approval" → Only Engineering Directors see it</li>
                <li><strong>Role-specific:</strong> "Senior Engineer Guidelines" → Only Senior Engineers see it</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentTargetingVisibilityDemo;