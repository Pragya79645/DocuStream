import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ListFilter, FileDown } from 'lucide-react';
import { UploadDocumentButton } from './upload-document-button';
import { DocumentTargetingFilter } from './document-targeting-filter';

type DocumentListControlsProps = {
  onUploadComplete: () => void;
  activeTab: 'all' | 'pending' | 'completed';
  onTabChange: (tab: 'all' | 'pending' | 'completed') => void;
  selectedTargeting: 'all' | 'department' | 'role' | 'executive' | 'management' | 'senior' | 'junior';
  onTargetingChange: (targeting: 'all' | 'department' | 'role' | 'executive' | 'management' | 'senior' | 'junior') => void;
};

export function DocumentListControls({ onUploadComplete, activeTab, onTabChange, selectedTargeting, onTargetingChange }: DocumentListControlsProps) {
  return (
    <div className="flex items-center">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'all' | 'pending' | 'completed')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="ml-auto flex items-center gap-2">
        <DocumentTargetingFilter 
          selectedTargeting={selectedTargeting}
          onTargetingChange={onTargetingChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Filter
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Date Range
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>File Type</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Priority</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <FileDown className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Export
          </span>
        </Button>
        <UploadDocumentButton onUploadComplete={onUploadComplete} />
      </div>
    </div>
  );
}
