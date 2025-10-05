'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { extractActionPointsAndCategorizeDocuments } from '@/ai/flows/extract-action-points-and-categorize-documents';
import { processZipFile } from '@/ai/flows/process-zip-file';

type UploadDocumentButtonProps = {
  onUploadComplete: () => void;
};

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


async function getCloudinarySignature(): Promise<{ signature: string, timestamp: number }> {
    const response = await fetch('/api/sign-cloudinary-params', {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to get Cloudinary signature');
    }
    return response.json();
}

async function uploadToCloudinary(file: File, signature: string, timestamp: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload file to Cloudinary');
    }

    return response.json();
}


export function UploadDocumentButton({ onUploadComplete }: UploadDocumentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        toast({
            title: 'File Too Large',
            description: `The selected file exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`,
            variant: 'destructive',
        });
        setFile(null); // Clear the invalid file
        return;
      }

      setFile(selectedFile);
      if (!title) {
        // Prefill title by cleaning up file name
        const isZip = selectedFile.type === 'application/zip' || 
                     selectedFile.type === 'application/x-zip-compressed' || 
                     selectedFile.name.toLowerCase().endsWith('.zip');
        
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setTitle(isZip ? `${baseName} Archive` : baseName);
      }
    }
  };

  const clearForm = () => {
    setFile(null);
    setTitle('');
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title || !user) {
      toast({
        title: 'Missing information',
        description: 'Please select a file, provide a title, and be logged in.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Check if it's a zip file before uploading
      const isZip = file.type === 'application/zip' || 
                   file.type === 'application/x-zip-compressed' || 
                   file.name.toLowerCase().endsWith('.zip');

      // 1. Get signature from our backend
      const { signature, timestamp } = await getCloudinarySignature();

      // 2. Upload the file to Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file, signature, timestamp);
      
      const { secure_url, original_filename, resource_type, format, public_id } = cloudinaryResponse;

      toast({
        title: 'Upload Complete',
        description: isZip 
          ? `"${original_filename}" uploaded. Extracting and processing files inside the archive...`
          : `"${original_filename}" is now being processed by AI. This can take a moment.`,
      });
      
      // Close the dialog while AI processes
      setIsOpen(false); 
      clearForm();

      if (isZip) {
        // 3a. Call the new zip processing flow
        processZipFile({
            fileUrl: secure_url,
            uploaderId: user.id,
        }).then(result => {
            toast({
                title: 'Zip Processing Complete',
                description: `"${title}" processed. Found ${result.fileCount} files inside.`,
            });
            onUploadComplete();
        }).catch(error => {
            console.error("Zip Flow error:", error);
            toast({
                title: 'AI Processing Error',
                description: 'The zip file was uploaded but failed during AI analysis.',
                variant: 'destructive',
            });
        });
      } else {
        // 3b. Call the existing single document flow
        extractActionPointsAndCategorizeDocuments({
            fileUrl: secure_url,
            originalFilename: original_filename,
            fileType: `${resource_type}/${format}`,
            uploaderId: user.id,
            title,
        }).then(result => {
            toast({
                title: 'Processing Complete',
                description: `"${title}" processed. Categorized as ${result.department} with ${result.actionPoints.length} action points.`,
            });
            onUploadComplete();
        }).catch(error => {
            console.error("AI Flow error:", error);
            toast({
                title: 'AI Processing Error',
                description: 'The document was uploaded but failed during AI analysis.',
                variant: 'destructive',
            });
        });
      }
      
    } catch (error) {
      console.error(error);
      toast({
        title: 'An Error Occurred',
        description: error instanceof Error ? error.message : 'An unknown error occurred during processing.',
        variant: 'destructive',
      });
    } finally {
      // We set processing to false immediately after starting the AI flow
      // to allow the user to continue using the app.
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) clearForm();
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Upload Document
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document file (PDF, Word, images) or a zip archive containing multiple documents. 
              Zip files will be automatically extracted and each file will be processed individually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="title">Document Title / Archive Name</Label>
              <Input 
                id="title" 
                type="text" 
                placeholder="e.g., Q3 Financial Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="doc-file">Document File</Label>
              <Input 
                id="doc-file" 
                type="file" 
                onChange={handleFileChange}
                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*, application/zip, application/x-zip-compressed, .zip"
              />
            </div>
            {file && (
              <div className="text-sm text-muted-foreground">
                <p>Selected file: {file.name}</p>
                {(file.type === 'application/zip' || 
                  file.type === 'application/x-zip-compressed' || 
                  file.name.toLowerCase().endsWith('.zip')) && (
                  <p className="text-blue-600 font-medium">
                    📁 Archive detected - files will be extracted and processed individually
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isProcessing}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isProcessing || !file || !title}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                 <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process
                 </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
