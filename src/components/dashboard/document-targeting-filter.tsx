import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Users, User, Crown, Briefcase, Filter } from 'lucide-react';

interface DocumentTargetingFilterProps {
  selectedTargeting: 'all' | 'department' | 'role' | 'executive' | 'management' | 'senior' | 'junior';
  onTargetingChange: (targeting: 'all' | 'department' | 'role' | 'executive' | 'management' | 'senior' | 'junior') => void;
}

const filterOptions = [
  { value: 'all', label: 'All Documents', icon: Filter },
  { value: 'department', label: 'Department-wide', icon: Users },
  { value: 'role', label: 'Role-specific', icon: User },
  { value: 'executive', label: 'Executive Level', icon: Crown },
  { value: 'management', label: 'Management Level', icon: Briefcase },
  { value: 'senior', label: 'Senior Level', icon: User },
  { value: 'junior', label: 'Junior Level', icon: User },
] as const;

export function DocumentTargetingFilter({ selectedTargeting, onTargetingChange }: DocumentTargetingFilterProps) {
  const selectedOption = filterOptions.find(option => option.value === selectedTargeting) || filterOptions[0];
  const Icon = selectedOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Icon className="mr-2 h-4 w-4" />
          {selectedOption.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuLabel>Filter by Targeting</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onTargetingChange('all')}>
          <Filter className="mr-2 h-4 w-4" />
          All Documents
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onTargetingChange('department')}>
          <Users className="mr-2 h-4 w-4" />
          Department-wide
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onTargetingChange('role')}>
          <User className="mr-2 h-4 w-4" />
          Role-specific
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">By Role Level</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => onTargetingChange('executive')}>
          <Crown className="mr-2 h-4 w-4 text-purple-600" />
          Executive Level
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onTargetingChange('management')}>
          <Briefcase className="mr-2 h-4 w-4 text-blue-600" />
          Management Level
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onTargetingChange('senior')}>
          <User className="mr-2 h-4 w-4 text-green-600" />
          Senior Level
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onTargetingChange('junior')}>
          <User className="mr-2 h-4 w-4 text-gray-600" />
          Junior Level
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DocumentTargetingFilter;