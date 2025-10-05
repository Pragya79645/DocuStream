import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Document } from '@/lib/types';
import { User, Users, Crown, Briefcase } from 'lucide-react';

interface DocumentTargetingBadgeProps {
  document: Document;
  className?: string;
}

const getRoleIcon = (roleLevel?: string) => {
  switch (roleLevel) {
    case 'executive':
      return <Crown className="w-3 h-3" />;
    case 'management':
      return <Briefcase className="w-3 h-3" />;
    case 'senior':
    case 'junior':
      return <User className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getRoleLevelColor = (roleLevel?: string) => {
  switch (roleLevel) {
    case 'executive':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300';
    case 'management':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300';
    case 'senior':
      return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
    case 'junior':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
  }
};

export function DocumentTargetingBadge({ document, className = '' }: DocumentTargetingBadgeProps) {
  if (document.targetingType === 'department') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`${className} bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300`}
            >
              <Users className="w-3 h-3 mr-1" />
              Department-wide
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>This document is intended for all members of the department</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (document.targetingType === 'role' && document.roleClassification) {
    const { roleTitle, roleLevel, confidence } = document.roleClassification;
    const roleColor = getRoleLevelColor(roleLevel);
    const roleIcon = getRoleIcon(roleLevel);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`${className} ${roleColor}`}
            >
              {roleIcon}
              <span className="ml-1">{roleTitle}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>This document is targeted at a specific role:</p>
              <p className="font-semibold">{roleTitle}</p>
              <p className="text-sm text-muted-foreground">
                Role Level: {roleLevel}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Fallback for documents without targeting classification
  return (
    <Badge variant="outline" className={className}>
      <Users className="w-3 h-3 mr-1" />
      Department
    </Badge>
  );
}

export default DocumentTargetingBadge;