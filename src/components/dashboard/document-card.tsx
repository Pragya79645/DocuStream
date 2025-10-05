import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Document, User as UserType } from '@/lib/types';
import { DocumentViewDialog } from './document-view-dialog';
import { DocumentTargetingBadge } from '@/components/ui/document-targeting-badge';

type DocumentCardProps = {
  document: Document;
  uploader: UserType;
};

export function DocumentCard({ document, uploader }: DocumentCardProps) {
  const completedActions = document.actionPoints.filter(
    (ap) => ap.isCompleted
  ).length;
  const totalActions = document.actionPoints.length;
  const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-4">
          <span className="font-headline text-lg">{document.title}</span>
          <div className="flex gap-2">
            <DocumentTargetingBadge document={document} />
            <Badge variant={progress === 100 ? 'secondary' : 'outline'}>
              {progress === 100 ? 'Completed' : 'Pending'}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> {document.fileType}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={document.uploadedAt} title={format(new Date(document.uploadedAt), "PPP p")}>
              {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
            </time>
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {uploader.name}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Action Points</span>
            <span>
              {completedActions} / {totalActions}
            </span>
          </div>
          <Progress value={progress} aria-label={`${progress}% completed`} />
        </div>
      </CardContent>
      <CardFooter>
        <DocumentViewDialog document={document} uploader={uploader}>
          <Button variant="outline" size="sm" className="ml-auto">
            View Details <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DocumentViewDialog>
      </CardFooter>
    </Card>
  );
}
