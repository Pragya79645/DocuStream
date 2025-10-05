/**
 * @fileOverview Service for classifying document targeting (department vs role-specific)
 * 
 * This service determines whether a document is intended for:
 * - An entire department (e.g., all of Engineering, all of Marketing)
 * - A specific role within a department (e.g., CEO of Engineering, Manager of Marketing)
 */

import { DocumentTargetingClassification, DepartmentRoleMapping, RolePattern } from '@/lib/types';

// Define role patterns for each department
const DEPARTMENT_ROLE_MAPPINGS: DepartmentRoleMapping[] = [
  {
    departmentId: 'eng',
    departmentName: 'Engineering',
    commonRoles: {
      ceo: {
        roleKeywords: ['ceo', 'chief executive', 'executive officer', 'head of engineering', 'engineering director'],
        departmentKeywords: ['engineering', 'technical', 'development'],
        roleLevel: 'executive',
        commonTitles: ['CEO of Engineering', 'Chief Engineering Officer', 'VP Engineering', 'Engineering Director']
      },
      manager: {
        roleKeywords: ['manager', 'team lead', 'lead engineer', 'engineering manager'],
        departmentKeywords: ['engineering', 'technical', 'development'],
        roleLevel: 'management',
        commonTitles: ['Engineering Manager', 'Technical Manager', 'Development Manager']
      },
      senior: {
        roleKeywords: ['senior engineer', 'principal engineer', 'staff engineer', 'senior developer'],
        departmentKeywords: ['engineering', 'technical', 'development'],
        roleLevel: 'senior',
        commonTitles: ['Senior Engineer', 'Principal Engineer', 'Staff Engineer']
      }
    }
  },
  {
    departmentId: 'mkt',
    departmentName: 'Marketing',
    commonRoles: {
      manager: {
        roleKeywords: ['manager of marketing', 'marketing manager', 'head of marketing', 'marketing director'],
        departmentKeywords: ['marketing', 'brand', 'promotion', 'advertising'],
        roleLevel: 'management',
        commonTitles: ['Manager of Marketing', 'Marketing Manager', 'Marketing Director']
      },
      specialist: {
        roleKeywords: ['marketing specialist', 'brand specialist', 'digital marketing specialist'],
        departmentKeywords: ['marketing', 'brand', 'digital', 'social media'],
        roleLevel: 'senior',
        commonTitles: ['Marketing Specialist', 'Digital Marketing Specialist', 'Brand Specialist']
      }
    }
  },
  {
    departmentId: 'fin',
    departmentName: 'Finance',
    commonRoles: {
      cfo: {
        roleKeywords: ['cfo', 'chief financial officer', 'finance director', 'head of finance'],
        departmentKeywords: ['finance', 'financial', 'accounting', 'budget'],
        roleLevel: 'executive',
        commonTitles: ['CFO', 'Chief Financial Officer', 'Finance Director']
      },
      manager: {
        roleKeywords: ['finance manager', 'accounting manager', 'financial manager'],
        departmentKeywords: ['finance', 'financial', 'accounting'],
        roleLevel: 'management',
        commonTitles: ['Finance Manager', 'Accounting Manager', 'Financial Manager']
      }
    }
  },
  {
    departmentId: 'hr',
    departmentName: 'HR',
    commonRoles: {
      director: {
        roleKeywords: ['hr director', 'human resources director', 'head of hr', 'chief people officer'],
        departmentKeywords: ['hr', 'human resources', 'people', 'talent'],
        roleLevel: 'executive',
        commonTitles: ['HR Director', 'Human Resources Director', 'Chief People Officer']
      },
      manager: {
        roleKeywords: ['hr manager', 'human resources manager', 'people manager'],
        departmentKeywords: ['hr', 'human resources', 'people'],
        roleLevel: 'management',
        commonTitles: ['HR Manager', 'Human Resources Manager', 'People Manager']
      }
    }
  },
  {
    departmentId: 'ops',
    departmentName: 'Operations',
    commonRoles: {
      director: {
        roleKeywords: ['operations director', 'head of operations', 'ops director'],
        departmentKeywords: ['operations', 'operational', 'ops'],
        roleLevel: 'executive',
        commonTitles: ['Operations Director', 'Head of Operations', 'VP Operations']
      },
      manager: {
        roleKeywords: ['operations manager', 'ops manager', 'operational manager'],
        departmentKeywords: ['operations', 'operational', 'ops'],
        roleLevel: 'management',
        commonTitles: ['Operations Manager', 'Ops Manager']
      }
    }
  },
  {
    departmentId: 'legal',
    departmentName: 'Legal',
    commonRoles: {
      counsel: {
        roleKeywords: ['general counsel', 'chief legal officer', 'head of legal', 'legal director'],
        departmentKeywords: ['legal', 'law', 'compliance', 'regulatory'],
        roleLevel: 'executive',
        commonTitles: ['General Counsel', 'Chief Legal Officer', 'Legal Director']
      },
      attorney: {
        roleKeywords: ['legal counsel', 'attorney', 'lawyer', 'legal advisor'],
        departmentKeywords: ['legal', 'law', 'compliance'],
        roleLevel: 'senior',
        commonTitles: ['Legal Counsel', 'Attorney', 'Legal Advisor']
      }
    }
  }
];

// Keywords that typically indicate department-wide documents
const DEPARTMENT_WIDE_INDICATORS = [
  'all team members',
  'entire department',
  'whole team',
  'department wide',
  'all staff',
  'everyone in',
  'team announcement',
  'department policy',
  'general notice',
  'company wide',
  'organization',
  'all employees'
];

// Keywords that typically indicate role-specific documents
const ROLE_SPECIFIC_INDICATORS = [
  'manager only',
  'executives only',
  'leadership team',
  'senior staff',
  'management review',
  'director level',
  'confidential',
  'restricted access',
  'for approval',
  'executive summary',
  'management decision',
  'leadership directive'
];

/**
 * Analyzes document content to determine if it's targeted at a whole department or specific role
 */
export function classifyDocumentTargeting(
  documentTitle: string,
  documentContent: string,
  primaryDepartmentId: string
): DocumentTargetingClassification {
  const title = documentTitle.toLowerCase();
  const content = documentContent.toLowerCase();
  const combinedText = `${title} ${content}`;

  // Find department mapping
  const departmentMapping = DEPARTMENT_ROLE_MAPPINGS.find(
    mapping => mapping.departmentId === primaryDepartmentId
  );

  let roleClassification: DocumentTargetingClassification['roleClassification'];
  let detectedPatterns: string[] = [];
  let confidence = 0;

  // Check for department-wide indicators
  const departmentWideMatches = DEPARTMENT_WIDE_INDICATORS.filter(indicator => 
    combinedText.includes(indicator)
  );

  // Check for role-specific indicators
  const roleSpecificMatches = ROLE_SPECIFIC_INDICATORS.filter(indicator =>
    combinedText.includes(indicator)
  );

  // Check for specific role patterns
  let roleMatches: { role: string; pattern: RolePattern; matchedKeywords: string[] }[] = [];
  
  if (departmentMapping) {
    Object.entries(departmentMapping.commonRoles).forEach(([roleType, pattern]) => {
      const matchedKeywords = pattern.roleKeywords.filter(keyword =>
        combinedText.includes(keyword)
      );
      
      if (matchedKeywords.length > 0) {
        roleMatches.push({
          role: roleType,
          pattern,
          matchedKeywords
        });
      }
    });
  }

  // Determine classification based on matches
  if (roleMatches.length > 0 && roleSpecificMatches.length > 0) {
    // Strong indication of role-specific document
    const bestRoleMatch = roleMatches.reduce((best, current) => 
      current.matchedKeywords.length > best.matchedKeywords.length ? current : best
    );

    roleClassification = {
      departmentId: primaryDepartmentId,
      roleTitle: bestRoleMatch.pattern.commonTitles[0],
      roleLevel: bestRoleMatch.pattern.roleLevel,
      matchedKeywords: bestRoleMatch.matchedKeywords
    };

    detectedPatterns = [
      ...bestRoleMatch.matchedKeywords,
      ...roleSpecificMatches
    ];

    confidence = Math.min(0.9, (bestRoleMatch.matchedKeywords.length * 0.3) + (roleSpecificMatches.length * 0.2));

    return {
      targetingType: 'role',
      confidence,
      reasoning: `Document contains specific role indicators (${roleSpecificMatches.join(', ')}) and role-specific keywords (${bestRoleMatch.matchedKeywords.join(', ')})`,
      detectedPatterns,
      roleClassification
    };
  } else if (roleMatches.length > 0 && departmentWideMatches.length === 0) {
    // Role keywords present but no department-wide indicators
    const bestRoleMatch = roleMatches.reduce((best, current) => 
      current.matchedKeywords.length > best.matchedKeywords.length ? current : best
    );

    roleClassification = {
      departmentId: primaryDepartmentId,
      roleTitle: bestRoleMatch.pattern.commonTitles[0],
      roleLevel: bestRoleMatch.pattern.roleLevel,
      matchedKeywords: bestRoleMatch.matchedKeywords
    };

    detectedPatterns = bestRoleMatch.matchedKeywords;
    confidence = Math.min(0.7, bestRoleMatch.matchedKeywords.length * 0.25);

    return {
      targetingType: 'role',
      confidence,
      reasoning: `Document contains role-specific keywords (${bestRoleMatch.matchedKeywords.join(', ')}) without department-wide indicators`,
      detectedPatterns,
      roleClassification
    };
  } else if (departmentWideMatches.length > 0) {
    // Strong indication of department-wide document
    detectedPatterns = departmentWideMatches;
    confidence = Math.min(0.9, departmentWideMatches.length * 0.3);

    return {
      targetingType: 'department',
      confidence,
      reasoning: `Document contains department-wide indicators (${departmentWideMatches.join(', ')})`,
      detectedPatterns
    };
  } else {
    // Default to department-wide with lower confidence
    confidence = 0.5;

    return {
      targetingType: 'department',
      confidence,
      reasoning: 'No specific targeting indicators found, defaulting to department-wide distribution',
      detectedPatterns: []
    };
  }
}

/**
 * Gets all available roles for a specific department
 */
export function getDepartmentRoles(departmentId: string): RolePattern[] {
  const departmentMapping = DEPARTMENT_ROLE_MAPPINGS.find(
    mapping => mapping.departmentId === departmentId
  );
  
  if (!departmentMapping) {
    return [];
  }

  return Object.values(departmentMapping.commonRoles);
}

/**
 * Gets all department role mappings
 */
export function getAllDepartmentRoleMappings(): DepartmentRoleMapping[] {
  return DEPARTMENT_ROLE_MAPPINGS;
}

/**
 * Validates if a role exists within a department
 */
export function isValidRoleForDepartment(departmentId: string, roleTitle: string): boolean {
  const departmentMapping = DEPARTMENT_ROLE_MAPPINGS.find(
    mapping => mapping.departmentId === departmentId
  );
  
  if (!departmentMapping) {
    return false;
  }

  return Object.values(departmentMapping.commonRoles).some(pattern =>
    pattern.commonTitles.some(title => 
      title.toLowerCase() === roleTitle.toLowerCase()
    )
  );
}