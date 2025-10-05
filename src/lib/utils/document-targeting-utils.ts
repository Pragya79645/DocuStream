import { Document } from '@/lib/types';

/**
 * Utility functions for filtering documents by targeting type and role level
 */

export type TargetingFilter = 'all' | 'department' | 'role' | 'executive' | 'management' | 'senior' | 'junior';

/**
 * Filters documents based on targeting type and role level
 */
export function filterDocumentsByTargeting(documents: Document[], filter: TargetingFilter): Document[] {
  switch (filter) {
    case 'all':
      return documents;
    
    case 'department':
      return documents.filter(doc => doc.targetingType === 'department');
    
    case 'role':
      return documents.filter(doc => doc.targetingType === 'role');
    
    case 'executive':
      return documents.filter(doc => 
        doc.targetingType === 'role' && 
        doc.roleClassification?.roleLevel === 'executive'
      );
    
    case 'management':
      return documents.filter(doc => 
        doc.targetingType === 'role' && 
        doc.roleClassification?.roleLevel === 'management'
      );
    
    case 'senior':
      return documents.filter(doc => 
        doc.targetingType === 'role' && 
        doc.roleClassification?.roleLevel === 'senior'
      );
    
    case 'junior':
      return documents.filter(doc => 
        doc.targetingType === 'role' && 
        doc.roleClassification?.roleLevel === 'junior'
      );
    
    default:
      return documents;
  }
}

/**
 * Gets the count of documents for each targeting filter
 */
export function getTargetingFilterCounts(documents: Document[]): Record<TargetingFilter, number> {
  return {
    all: documents.length,
    department: documents.filter(doc => doc.targetingType === 'department').length,
    role: documents.filter(doc => doc.targetingType === 'role').length,
    executive: documents.filter(doc => 
      doc.targetingType === 'role' && 
      doc.roleClassification?.roleLevel === 'executive'
    ).length,
    management: documents.filter(doc => 
      doc.targetingType === 'role' && 
      doc.roleClassification?.roleLevel === 'management'
    ).length,
    senior: documents.filter(doc => 
      doc.targetingType === 'role' && 
      doc.roleClassification?.roleLevel === 'senior'
    ).length,
    junior: documents.filter(doc => 
      doc.targetingType === 'role' && 
      doc.roleClassification?.roleLevel === 'junior'
    ).length,
  };
}

/**
 * Checks if a document should be visible to a user based on their role and department
 * 
 * Logic:
 * - Department-wide documents: Visible to ALL members of the department (including heads/executives)
 * - Role-specific documents: Only visible to users with matching roles in that department
 */
export function isDocumentVisibleToUser(
  document: Document, 
  user: { categoryIds: string[]; departmentRoles?: { [departmentId: string]: { roleTitle: string; roleLevel: string } } }
): boolean {
  // Check if user's department matches document's category
  const hasAccessToDepartment = user.categoryIds.includes(document.categoryId);
  
  // Check if user has access through affected departments
  const hasAccessToCrossDepartment = document.affectedDepartmentIds?.some(
    deptId => user.categoryIds.includes(deptId)
  ) || false;
  
  if (!hasAccessToDepartment && !hasAccessToCrossDepartment) {
    return false;
  }
  
  // If document is department-wide, ALL department members can see it
  // This includes both regular members and executives/heads
  if (document.targetingType === 'department') {
    return true;
  }
  
  // If document is role-specific, only users with matching roles can see it
  if (document.targetingType === 'role' && document.roleClassification) {
    const targetDepartment = document.categoryId;
    const userRoleInDepartment = user.departmentRoles?.[targetDepartment];
    
    if (!userRoleInDepartment) {
      return false; // User has no specific role in this department
    }
    
    // Check if user's role matches the document's target role
    return doesUserRoleMatchDocumentTarget(
      userRoleInDepartment,
      document.roleClassification
    );
  }
  
  return false;
}

/**
 * Determines if a user's role matches the document's target role
 */
function doesUserRoleMatchDocumentTarget(
  userRole: { roleTitle: string; roleLevel: string },
  documentTarget: { roleTitle: string; roleLevel: string; departmentId: string }
): boolean {
  // Exact role title match (case-insensitive)
  if (userRole.roleTitle.toLowerCase() === documentTarget.roleTitle.toLowerCase()) {
    return true;
  }
  
  // Role level match for broader targeting
  if (userRole.roleLevel === documentTarget.roleLevel) {
    return true;
  }
  
  // Special cases for hierarchical access
  // Executives can see management documents, management can see senior documents, etc.
  const hierarchy = ['junior', 'senior', 'management', 'executive'];
  const userLevelIndex = hierarchy.indexOf(userRole.roleLevel);
  const targetLevelIndex = hierarchy.indexOf(documentTarget.roleLevel);
  
  // Higher level roles can see lower level documents (optional - you might not want this)
  // Uncomment the line below if executives should see all department documents
  // return userLevelIndex >= targetLevelIndex;
  
  return false;
}

/**
 * Checks if a user has a specific role in a department
 */
export function userHasRoleInDepartment(
  user: { departmentRoles?: { [departmentId: string]: { roleTitle: string; roleLevel: string } } },
  departmentId: string,
  roleTitle?: string,
  roleLevel?: string
): boolean {
  const userRole = user.departmentRoles?.[departmentId];
  if (!userRole) return false;
  
  if (roleTitle && userRole.roleTitle.toLowerCase() !== roleTitle.toLowerCase()) {
    return false;
  }
  
  if (roleLevel && userRole.roleLevel !== roleLevel) {
    return false;
  }
  
  return true;
}

/**
 * Gets all users who should receive a specific document based on targeting
 */
export function getUsersForDocument(
  document: Document,
  allUsers: { id: string; categoryIds: string[]; departmentRoles?: { [departmentId: string]: { roleTitle: string; roleLevel: string } } }[]
): string[] {
  const targetUsers: string[] = [];
  
  for (const user of allUsers) {
    if (isDocumentVisibleToUser(document, user)) {
      targetUsers.push(user.id);
    }
  }
  
  return targetUsers;
}

/**
 * Gets a human-readable description of the targeting filter
 */
export function getTargetingFilterDescription(filter: TargetingFilter): string {
  switch (filter) {
    case 'all':
      return 'All documents regardless of targeting';
    case 'department':
      return 'Documents intended for all department members';
    case 'role':
      return 'Documents targeted at specific roles';
    case 'executive':
      return 'Documents for executive-level roles (CEOs, Directors, VPs)';
    case 'management':
      return 'Documents for management-level roles (Managers, Team Leads)';
    case 'senior':
      return 'Documents for senior-level roles (Senior Engineers, Specialists)';
    case 'junior':
      return 'Documents for junior-level roles';
    default:
      return 'Unknown filter';
  }
}