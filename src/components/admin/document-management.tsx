'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User, Document as DocType, Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/services/users.service';
import { getCategories } from '@/lib/services/categories.service';
import { listenToAllDocuments } from '@/lib/client-services/documents.client.service';
import { updateDocument, deleteDocument } from '@/lib/services/documents.service';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function DocumentManagement() {
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const [usersData, categoriesData] = await Promise.all([
          getUsers(),
          getCategories()
        ]);
        setUsers(usersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToAllDocuments((docs) => {
        setDocuments(docs);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleCategoryChange = async (docId: string, newCategoryId: string) => {
    // Optimistic update
    setDocuments(prevDocs => prevDocs.map(d => d.id === docId ? {...d, categoryId: newCategoryId} : d));
    try {
        await updateDocument(docId, { categoryId: newCategoryId });
        toast({ title: "Success", description: "Document category updated." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update category.", variant: 'destructive'});
        // Revert on failure
        const originalDocs = [...documents];
        setDocuments(originalDocs);
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
        await deleteDocument(docId);
        toast({ title: "Success", description: "Document deleted successfully." });
        // The real-time listener will automatically remove it from the UI
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete document.", variant: 'destructive'});
    }
  }


  if (loading) {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">All Documents</h3>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const uploader = users.find((u) => u.id === doc.uploaderId);
              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link href={`/dashboard/doc/${doc.id}`} className="font-medium hover:underline">{doc.title}</Link>
                    <div className="text-sm text-muted-foreground">
                      {doc.originalFilename}
                    </div>
                  </TableCell>
                  <TableCell>{uploader?.name}</TableCell>
                  <TableCell>
                    {doc.uploadedAt ? formatDistanceToNow(new Date(doc.uploadedAt), {
                      addSuffix: true,
                    }) : 'Just now'}
                  </TableCell>
                  <TableCell>
                    <Select value={doc.categoryId} onValueChange={(newCatId) => handleCategoryChange(doc.id, newCatId)}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/doc/${doc.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Document
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the document
                                    and all of its associated data.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)}>
                                    Yes, delete document
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
