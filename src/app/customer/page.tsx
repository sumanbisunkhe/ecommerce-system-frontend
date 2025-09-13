'use client';

import { useState, useEffect } from 'react';
import { Package2, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import Link from 'next/link';

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      setUser(userData);
    }
  }, []);

  return (
    <div className={`${funnelSans.className} space-y-6 p-6`}>
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.firstName || 'Customer'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Track your orders, manage your profile, and explore our latest products.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStat
          icon={<Package2 className="h-5 w-5" />}
          label="Total Orders"
          value="0"
          linkHref="/customer/orders"
        />
        <QuickStat
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Cart Items"
          value="0"
          linkHref="/customer/cart"
        />
        <QuickStat
          icon={<Clock className="h-5 w-5" />}
          label="Pending Orders"
          value="0"
          linkHref="/customer/orders?status=pending"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="text-center p-6 text-gray-500">
          No orders found
        </div>
      </div>
    </div>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value, 
  linkHref 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  linkHref: string;
}) {
  return (
    <Link href={linkHref}>
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
