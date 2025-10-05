'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Loader2, FileText, Brain } from 'lucide-react';
import type { Document, User as UserType, ActionPoint } from '@/lib/types';
import { format } from 'date-fns';
import { listenToDocument, updateActionPoints } from '@/lib/client-services/documents.client.service';
import { useToast } from '@/hooks/use-toast';


type DocumentViewDialogProps = {
  document: Document;
  uploader: UserType;
  children: React.ReactNode;
};

export function DocumentViewDialog({ document: initialDocument, uploader, children }: DocumentViewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [liveDocument, setLiveDocument] = useState<Document | null>(initialDocument);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = listenToDocument(initialDocument.id, (doc) => {
        setLiveDocument(doc);
    });

    return () => unsubscribe();
  }, [isOpen, initialDocument.id]);


  const handleCheckedChange = async (pointId: string) => {
    if (!liveDocument) return;

    const updatedPoints = liveDocument.actionPoints.map(p =>
      p.id === pointId ? { ...p, isCompleted: !p.isCompleted } : p
    );
    
    // Optimistically update the UI
    setLiveDocument({ ...liveDocument, actionPoints: updatedPoints });

    try {
        await updateActionPoints(liveDocument.id, updatedPoints);
    } catch (error) {
        toast({ title: "Error", description: "Could not update action point.", variant: 'destructive' });
        // Revert UI on error
        setLiveDocument(liveDocument);
    }
  };

  const handleGenerateSummary = async () => {
    if (!liveDocument) return;

    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/summarize-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: liveDocument.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      toast({ 
        title: "Success", 
        description: "Document summary generated successfully!" 
      });

      // The summary will be updated in the database and reflected via the real-time listener
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate document summary. Please try again.", 
        variant: 'destructive' 
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const doc = liveDocument;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        {!doc ? (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{doc.title}</DialogTitle>
                <DialogDescription>
                    Uploaded by {uploader.name} on {doc.uploadedAt ? format(new Date(doc.uploadedAt), "PPP") : ''}
                </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-2">
                    <Tabs defaultValue="action-points" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="action-points" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Action Points
                            </TabsTrigger>
                            <TabsTrigger value="summary" className="flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                Summary
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="action-points" className="mt-4">
                            <ScrollArea className="h-72 pr-4">
                                <div className="space-y-4">
                                    {doc.actionPoints.map((point) => (
                                        <div key={point.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`ap-${point.id}`}
                                                checked={point.isCompleted}
                                                onCheckedChange={() => handleCheckedChange(point.id)}
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor={`ap-${point.id}`}
                                                className={`flex-1 text-sm font-normal ${
                                                    point.isCompleted ? 'text-muted-foreground line-through' : ''
                                                }`}
                                            >
                                                {point.text}
                                            </Label>
                                        </div>
                                    ))}
                                    {doc.actionPoints.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No action points were extracted for this document.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="summary" className="mt-4">
                            <ScrollArea className="h-72 pr-4">
                                {doc.summary ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-medium text-muted-foreground">Document Summary</h4>
                                            <Button 
                                                onClick={handleGenerateSummary}
                                                disabled={isGeneratingSummary}
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                {isGeneratingSummary ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Regenerating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Brain className="h-4 w-4" />
                                                        Regenerate
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{doc.summary}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                                        <Brain className="h-12 w-12 text-muted-foreground" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                No summary available for this document yet.
                                            </p>
                                            <Button 
                                                onClick={handleGenerateSummary}
                                                disabled={isGeneratingSummary}
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                {isGeneratingSummary ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Brain className="h-4 w-4" />
                                                        Generate Summary
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
                <div>
                    <h3 className="mb-4 text-lg font-semibold">Document Details</h3>
                    <div className="space-y-4 rounded-md border bg-secondary/50 p-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Original File</p>
                        <p className="text-sm">{doc.originalFilename}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">File Type</p>
                        <p className="text-sm">{doc.fileType}</p>
                    </div>
                     <Separator />
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm capitalize">{doc.status}</p>
                    </div>
                    <Separator />
                    <Button asChild variant="outline" className="w-full">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        Preview Original File
                        <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                    </div>
                </div>
                </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
