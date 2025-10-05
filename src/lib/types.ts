import type { User as FirebaseUser } from 'firebase/auth';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  categoryIds: string[];
  role: 'admin' | 'user';
  // Department-specific role information
  departmentRoles?: {
    [departmentId: string]: {
      roleTitle: string; // e.g., "CEO of Engineering", "Head of Design", "Senior Engineer"
      roleLevel: 'executive' | 'management' | 'senior' | 'junior';
    };
  };
};

export type AppUser = User;
export type AuthUser = FirebaseUser;

export type Category = {
  id:string;
  name: string;
  icon: string; // Store icon name as a string e.g. "Briefcase"
};

export type ActionPoint = {
  id: string;
  text: string;
  isCompleted: boolean;
};

export type Document = {
  id: string;
  title: string;
  originalFilename: string;
  fileType: string;
  fileUrl?: string;
  uploadedAt: string; // ISO string format
  uploaderId: string;
  categoryId: string;
  // Cross-department tagging support
  affectedDepartmentIds?: string[]; // Additional departments that should be aware of this document
  crossDepartmentTags?: string[]; // Tags indicating what makes this relevant to multiple departments
  departmentRelevanceScore?: { [departmentId: string]: number }; // AI-calculated relevance scores (0-1)
  // Document targeting classification
  targetingType: 'department' | 'role'; // Whether this document is for a whole department or specific role
  specificRole?: string; // If targeting a specific role (e.g., "CEO", "Manager", "Head")
  roleClassification?: {
    departmentId: string; // The department this role belongs to
    roleTitle: string; // The specific role title (e.g., "CEO of Engineering", "Manager of Marketing")
    roleLevel: 'executive' | 'management' | 'senior' | 'junior'; // Role hierarchy level
    confidence: number; // AI confidence score (0-1) for the classification
  };
  actionPoints: ActionPoint[];
  summary?: string; // Optional for now
  status?: 'processing' | 'processed' | 'failed';
  isComplianceRelated?: boolean; // Flag to identify compliance documents
  complianceDeadline?: string; // ISO string format for compliance deadline
  priority?: 'low' | 'medium' | 'high'; // Priority level for documents
};

export type AuditLogEntry = {
  id:string;
  userId: string;
  action: string;
  timestamp: string; // ISO string format
  details: string;
};

export type Notification = {
    id: string;
    userId: string;
    message: string;
    href: string;
    isRead: boolean;
    createdAt: string; // ISO string format
}

export type ComplianceStatus = 'on-track' | 'due-soon' | 'overdue' | 'completed';

export type ComplianceDocument = {
    id: string;
    documentId: string; // Reference to the main document
    title: string;
    description?: string;
    dueDate: string; // ISO string format
    status: ComplianceStatus;
    categoryId: string;
    // Cross-department compliance support
    affectedDepartmentIds?: string[]; // Additional departments that need to comply
    departmentSpecificRequirements?: { [departmentId: string]: string }; // Specific requirements per department
    sharedCompliance?: boolean; // Flag to indicate if this requires coordination between departments
    assignedToIds: string[]; // User IDs responsible for compliance
    createdAt: string; // ISO string format
    updatedAt: string; // ISO string format
    completedAt?: string; // ISO string format when marked as completed
    notes?: string;
    reminderDays: number; // Days before due date to show "due soon" warning
}

export type ComplianceActionPoint = ActionPoint & {
    dueDate?: string; // ISO string format
    priority: 'low' | 'medium' | 'high';
    assignedToId?: string;
}

// Cross-department tagging types
export type DepartmentRelevance = {
    departmentId: string;
    relevanceScore: number; // 0-1 scale
    reason: string; // Why this document is relevant to this department
    tags: string[]; // Specific tags for this department relevance
}

export type CrossDepartmentDocument = {
    documentId: string;
    primaryDepartmentId: string;
    relevantDepartments: DepartmentRelevance[];
    crossDepartmentTags: string[];
    requiresCoordination: boolean;
    coordinationNotes?: string;
}

export type SharedAwarenessItem = {
    id: string;
    type: 'document' | 'compliance';
    title: string;
    primaryDepartment: string;
    affectedDepartments: string[];
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    lastUpdated: string;
    href: string;
    tags: string[];
}

// Document targeting classification types
export type RolePattern = {
    roleKeywords: string[]; // Keywords that indicate specific roles
    departmentKeywords: string[]; // Keywords that indicate departments
    roleLevel: 'executive' | 'management' | 'senior' | 'junior';
    commonTitles: string[]; // Common variations of the role title
}

export type DepartmentRoleMapping = {
    departmentId: string;
    departmentName: string;
    commonRoles: {
        [roleType: string]: RolePattern;
    };
}

export type DocumentTargetingClassification = {
    targetingType: 'department' | 'role';
    confidence: number; // 0-1 confidence score
    reasoning: string; // AI explanation for the classification
    detectedPatterns: string[]; // Specific patterns that led to this classification
    roleClassification?: {
        departmentId: string;
        roleTitle: string;
        roleLevel: 'executive' | 'management' | 'senior' | 'junior';
        matchedKeywords: string[];
    };
}
