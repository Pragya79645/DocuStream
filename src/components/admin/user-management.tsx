'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, UserPlus, Loader2, UserX } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '../ui/checkbox';
import type { User, Category } from '@/lib/types';
import { getUsers, updateUser, createUser, deleteUser } from '@/lib/services/users.service';
import { getCategories } from '@/lib/services/categories.service';
import { useToast } from '@/hooks/use-toast';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, categoriesData] = await Promise.all([getUsers(), getCategories()]);
      setUsers(usersData);
      setCategories(categoriesData);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch users or categories.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetInviteForm = () => {
    setEmail('');
    setName('');
    setAssignedCategories([]);
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createUser({
        email,
        name,
        categoryIds: assignedCategories,
        role: 'user', // Default role for new users
        avatarUrl: `https://i.pravatar.cc/150?u=${email}` // Placeholder avatar
      });
      toast({ title: "Success", description: "User invited successfully." });
      setInviteOpen(false);
      resetInviteForm();
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setAssignedCategories(user.categoryIds);
    setEditOpen(true);
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
        await updateUser(selectedUser.id, { categoryIds: assignedCategories });
        toast({ title: "Success", description: "User updated successfully." });
        setEditOpen(false);
        setSelectedUser(null);
        fetchData();
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser(userId);
        toast({ title: "Success", description: "User deleted successfully." });
        fetchData();
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: 'destructive' });
    }
  }


  const onCategoryCheckedChange = (checked: boolean, categoryId: string) => {
    setAssignedCategories(prev => {
        if (checked) {
            return [...prev, categoryId];
        } else {
            return prev.filter(id => id !== categoryId);
        }
    })
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Users</h3>
        {/* Invite User Dialog */}
        <Dialog open={isInviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInviteUser}>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Enter the user's details and assign them to relevant categories.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="name@kmrl.co.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2 rounded-md border p-4 max-h-48 overflow-y-auto">
                      {categories.map(category => (
                          <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`cat-invite-${category.id}`} 
                                checked={assignedCategories.includes(category.id)}
                                onCheckedChange={(checked) => onCategoryCheckedChange(!!checked, category.id)}
                              />
                              <Label htmlFor={`cat-invite-${category.id}`} className="font-normal">{category.name}</Label>
                          </div>
                      ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Send Invitation
                  </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Users Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Categories</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {user.categoryIds.map((catId) => {
                      const category = categories.find((c) => c.id === catId);
                      return (
                        <Badge key={catId} variant="outline">
                          {category?.name}
                        </Badge>
                      );
                    })}
                  </div>
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
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>Edit Categories</DropdownMenuItem>
                      {user.role !== 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={e => e.preventDefault()}>
                                <UserX className="mr-2 h-4 w-4" />
                                Delete User
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user
                                    and all their associated data.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    Yes, delete user
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent>
                <form onSubmit={handleUpdateUser}>
                <DialogHeader>
                    <DialogTitle>Edit Categories for {selectedUser.name}</DialogTitle>
                    <DialogDescription>
                    Modify the categories this user has access to.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                            {categories.map(category => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`cat-edit-${category.id}`} 
                                        checked={assignedCategories.includes(category.id)}
                                        onCheckedChange={(checked) => onCategoryCheckedChange(!!checked, category.id)}
                                    />
                                    <Label htmlFor={`cat-edit-${category.id}`} className="font-normal">{category.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
