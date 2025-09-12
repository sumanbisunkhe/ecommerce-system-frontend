'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/dashboard/admin/sidebar-nav';
import AdminHeader from '@/components/dashboard/admin/header';
import NotificationProvider from '@/components/ui/Notification';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default expanded width

  useEffect(() => {
    const getUserFromCookie = () => {
      const match = document.cookie.match(/(^|;) ?user=([^;]*)/);
      return match ? decodeURIComponent(match[2]) : null;
    };

    const userCookie = getUserFromCookie();

    if (!userCookie) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userCookie);
      if (!parsedUser.roles.includes('ADMIN')) {
        router.push('/unauthorized');
      } else {
        setUser(parsedUser);
      }
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    setSidebarWidth(collapsed ? 70 : 256);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <AdminHeader 
        user={user} 
        isSidebarCollapsed={isSidebarCollapsed}
        sidebarWidth={sidebarWidth}
      />

      <div className="flex flex-1 transition-all duration-300">
        {/* Sidebar */}
        <AdminSidebar 
          user={user} 
          onCollapse={handleSidebarCollapse} 
        />

        {/* Main Content */}
        <main
          style={{
            marginLeft: sidebarWidth,
            paddingTop: '64px', // Height of the header
            transition: 'margin-left 0.3s ease-in-out'
          }}
          className="flex-1 p-6 min-h-screen"
        >
          {children}
        </main>
      </div>

      <NotificationProvider />
    </div>
  );
}