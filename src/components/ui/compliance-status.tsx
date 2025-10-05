'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { ComplianceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { differenceInDays, format } from 'date-fns';

interface ComplianceStatusBadgeProps {
  status: ComplianceStatus;
  dueDate?: string;
  className?: string;
  showDueDate?: boolean;
}

export function ComplianceStatusBadge({ 
  status, 
  dueDate, 
  className,
  showDueDate = true 
}: ComplianceStatusBadgeProps) {
  const getStatusConfig = (status: ComplianceStatus) => {
    switch (status) {
      case 'on-track':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'On Track'
        };
      case 'due-soon':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Clock className="h-3 w-3" />,
          label: 'Due Soon'
        };
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Overdue'
        };
      case 'completed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Completed'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="h-3 w-3" />,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const getDaysText = () => {
    if (!dueDate || !showDueDate) return null;
    
    const days = differenceInDays(new Date(dueDate), new Date());
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else {
      return `${days} days remaining`;
    }
  };

  const daysText = getDaysText();

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <Badge 
        variant="outline" 
        className={cn("flex items-center space-x-1 w-fit", config.color)}
      >
        {config.icon}
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>
      
      {daysText && showDueDate && (
        <div className="text-xs text-muted-foreground">
          {daysText}
        </div>
      )}
      
      {dueDate && showDueDate && (
        <div className="text-xs text-muted-foreground">
          Due: {format(new Date(dueDate), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
}

interface ComplianceIndicatorProps {
  isComplianceRelated?: boolean;
  complianceDeadline?: string;
  priority?: 'low' | 'medium' | 'high';
  className?: string;
}

export function ComplianceIndicator({ 
  isComplianceRelated, 
  complianceDeadline, 
  priority,
  className 
}: ComplianceIndicatorProps) {
  if (!isComplianceRelated) return null;

  const calculateStatus = (): ComplianceStatus => {
    if (!complianceDeadline) return 'on-track';
    
    const days = differenceInDays(new Date(complianceDeadline), new Date());
    
    if (days < 0) return 'overdue';
    if (days <= 7) return 'due-soon';
    return 'on-track';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const status = calculateStatus();

  return (
    <div className={cn(
      "border-l-4 pl-3 py-2 bg-blue-50 rounded-r-md",
      getPriorityColor(priority || 'low'),
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Compliance
          </Badge>
          {priority && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                priority === 'high' && "bg-red-100 text-red-800 border-red-300",
                priority === 'medium' && "bg-yellow-100 text-yellow-800 border-yellow-300",
                priority === 'low' && "bg-green-100 text-green-800 border-green-300"
              )}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </Badge>
          )}
        </div>
        
        <ComplianceStatusBadge 
          status={status} 
          dueDate={complianceDeadline}
          showDueDate={false}
        />
      </div>
      
      {complianceDeadline && (
        <div className="text-xs text-muted-foreground mt-1">
          Compliance due: {format(new Date(complianceDeadline), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
}