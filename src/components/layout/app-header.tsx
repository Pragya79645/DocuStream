import Link from 'next/link';
import {
  Bell,
  Search,
  LogOut,
  Settings,
  MailCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import type { Notification } from '@/lib/types';
import { listenToUnreadNotifications, markAllNotificationsAsRead } from '@/lib/client-services/notifications.client.service';
import { formatDistanceToNow } from 'date-fns';


type AppHeaderProps = {
  breadcrumbs: { href: string; label: string }[];
  pageTitle: string;
};

export function AppHeader({ breadcrumbs, pageTitle }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = listenToUnreadNotifications(user.id, (newNotifications) => {
      setNotifications(newNotifications);
    });
    return () => unsubscribe();
  }, [user?.id]);
  
  const handleMarkAllRead = async () => {
    if (!user?.id || unreadNotifications.length === 0) return;
    await markAllNotificationsAsRead(user.id);
    // The listener will automatically update the UI
  }


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <>
                <BreadcrumbItem key={crumb.href}>
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbs.length -1 && <BreadcrumbSeparator />}
              </>
            ))}
             <BreadcrumbSeparator />
             <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>
        </form>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                  {unreadNotifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadNotifications.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  {unreadNotifications.length} unread
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              <>
              {notifications.slice(0,5).map(notification => (
                 <DropdownMenuItem key={notification.id} asChild className={`flex items-start gap-2 ${!notification.isRead && 'bg-accent/50'}`}>
                   <Link href={notification.href}>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                           {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                   </Link>
                 </DropdownMenuItem>
              ))}
               <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Button variant="ghost" className="w-full" onClick={handleMarkAllRead} disabled={unreadNotifications.length === 0}>
                        <MailCheck className="mr-2 h-4 w-4" />
                        Mark all as read
                    </Button>
                </DropdownMenuItem>
              </>
            ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No new notifications</p>
            )}
           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
               <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user?.name ? user.name.charAt(0) : '?'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4"/>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
