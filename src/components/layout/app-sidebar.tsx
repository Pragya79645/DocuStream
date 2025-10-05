'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderCog,
  FileClock,
  Train,
  Briefcase,
  Wrench,
  HardHat,
  Scale,
  ShoppingCart,
  Shield,
  FileText,
  BarChart2,
  CheckSquare,
  Archive,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/services/categories.service';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Briefcase,
  Users,
  Wrench,
  Train,
  HardHat,
  Scale,
  ShoppingCart,
  Shield,
  FileText, // Default/fallback icon
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        setAllCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories for sidebar", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  if (!user) return null; // Or a loading skeleton

  const isActive = (path: string) => pathname === path;
  const isAdmin = user.role === 'admin';

  const userCategories = isAdmin
    ? allCategories
    : allCategories.filter((c) => user.categoryIds.includes(c.id));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <span className="font-headline text-lg font-semibold">DocuStream</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/compliance')}
              tooltip="Compliance Tracker"
            >
              <Link href="/dashboard/compliance">
                <CheckSquare />
                <span>Compliance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard/cross-department')}
              tooltip="Cross-Department Feed"
            >
              <Link href="/dashboard/cross-department">
                <Globe />
                <span>Department Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>Tools & Demos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/document-targeting-demo')}
                  tooltip="Document Targeting Demo"
                >
                  <Link href="/dashboard/document-targeting-demo">
                    <FileText />
                    <span>Targeting Demo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!loadingCategories && userCategories.map((category) => {
                const CategoryIcon = iconMap[category.icon] || FileText;
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes(`category=${category.id}`)}
                      tooltip={category.name}
                    >
                      <Link href={`/dashboard?category=${category.id}`}>
                        <CategoryIcon />
                        <span>{category.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/dashboard/admin' && !pathname.includes('tab=')}
                    tooltip="User Management"
                  >
                    <Link href="/dashboard/admin">
                      <Users />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('tab=categories')}
                    tooltip="Category Management"
                  >
                    <Link href="/dashboard/admin?tab=categories">
                      <FolderCog />
                      <span>Categories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('/dashboard/admin/knowledge-hub')}
                    tooltip="Knowledge Hub"
                  >
                    <Link href="/dashboard/admin/knowledge-hub">
                      <Archive />
                      <span>Knowledge Hub</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('tab=reports')}
                    tooltip="Reporting"
                  >
                    <Link href="/dashboard/admin?tab=reports">
                      <BarChart2 />
                      <span>Reporting</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('tab=audit')}
                    tooltip="Audit Log"
                  >
                    <Link href="/dashboard/admin?tab=audit">
                      <FileClock />
                      <span>Audit Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes('tab=compliance')}
                    tooltip="Compliance Management"
                  >
                    <Link href="/dashboard/admin?tab=compliance">
                      <CheckSquare />
                      <span>Compliance</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
