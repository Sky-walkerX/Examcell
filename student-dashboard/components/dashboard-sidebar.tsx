"use client"; // Needs usePathname and client-side logic like signOut

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  PieChart,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  userType: "student" | "admin";
}

// Define types for menu items to include subItems
interface SubMenuItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const pathname = usePathname();

  // --- Logout Handler (Updated to handle button events) ---
  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default button behavior
    signOut({ callbackUrl: "/" }); // Call signOut, redirect to home after
  };

  // --- Menu Item Definitions ---
  const studentMenuItems: MenuItem[] = [
    { title: "Dashboard", href: "/student/dashboard", icon: Home },
    { title: "Results", href: "/student/results", icon: FileText },
    { title: "Performance", href: "/student/performance", icon: BarChart3 },
    { title: "Profile", href: "/student/profile", icon: Users },
  ];

  const adminMenuItems: MenuItem[] = [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    {
      title: "Students",
      href: "/admin/students",
      icon: Users,
      subItems: [
        { title: "All Students", href: "/admin/students" },
        { title: "Add Student", href: "/admin/students/new" },
      ],
    },
    {
      title: "Results",
      href: "/admin/results",
      icon: FileText,
      subItems: [
        { title: "All Results", href: "/admin/results" },
        { title: "Add Result", href: "/admin/results/new" },
        { title: "By Semester", href: "/admin/results/by-semester" },
      ],
    },
    { title: "Upload Data", href: "/admin/upload", icon: Upload },
    { title: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { title: "Analytics", href: "/admin/analytics", icon: PieChart },
  ];

  const menuItems = userType === "student" ? studentMenuItems : adminMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-lg">EduResults</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isParentActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) &&
                item.href !== `/${userType}/dashboard`);
            const shouldShowSubItems = item.subItems && isParentActive;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isParentActive} tooltip={item.title}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {shouldShowSubItems && (
                  <div className="pl-7 mt-1 space-y-0.5 border-l border-border/50 ml-3">
                    {item.subItems?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`text-sm block py-1 px-2 rounded-md ${
                          pathname === subItem.href
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={pathname === `/${userType}/settings`}
            >
              <Link href={`/${userType}/settings`}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild={false}
              tooltip="Logout"
              onClick={handleLogout}
              className="w-full justify-start cursor-pointer"
            >
              <>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}