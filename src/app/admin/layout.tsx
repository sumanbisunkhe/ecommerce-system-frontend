'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/dashboard/admin/sidebar-nav';
import AdminHeader from '@/components/dashboard/admin/header';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <AdminHeader user={user} />

      <div className="flex flex-1 transition-all duration-300">
        {/* Sidebar */}
        <AdminSidebar user={user} onCollapse={setIsSidebarCollapsed} />

        {/* Main Content */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
