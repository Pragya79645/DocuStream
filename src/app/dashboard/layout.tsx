'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/');
    }
  }, [authUser, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/admin/knowledge-hub')) return 'Knowledge Hub';
    if (pathname.startsWith('/dashboard/admin')) return 'Admin';
    if (pathname.startsWith('/dashboard/category')) return 'Category';
    if (pathname.startsWith('/dashboard/cross-department')) return 'Cross-Department Feed';
    return 'My Documents';
  }

  const breadcrumbs = [{ href: '/dashboard', label: 'Dashboard' }];
  const pageTitle = getPageTitle();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AppHeader breadcrumbs={breadcrumbs} pageTitle={pageTitle} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
