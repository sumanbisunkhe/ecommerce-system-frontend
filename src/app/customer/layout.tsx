'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerHeader from '@/components/dashboard/customer/header';
import Footer from '@/components/ui/Footer';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
        
        if (!userData.roles.includes('CUSTOMER')) {
          router.push('/unauthorized');
          return;
        }

        // Always redirect root customer path to products
        if (window.location.pathname === '/customer') {
          router.replace('/customer/products');
          return;
        }
      } catch (error) {
        router.push('/auth/login');
      }
    } else {
      router.push('/auth/login');
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
      <CustomerHeader user={user} />
      {/* Add padding-top to account for the fixed header */}
      <main className="min-h-screen "> {/* 16 = h-16 of the header */}
        {children}
      </main>
      <Footer />
    </div>
  );
}