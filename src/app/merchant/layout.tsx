'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import MerchantSidebar from '@/components/dashboard/merchant/sidebar-nav';
import MerchantHeader from '@/components/dashboard/merchant/header';

interface MerchantLayoutProps {
  children: ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has merchant role
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
        
        if (!userData.roles.includes('MERCHANT')) {
          router.push('/unauthorized');
        }
      } catch (error) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <MerchantHeader user={user} />
      <div className="flex">
        {/* <MerchantSidebar /> */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}