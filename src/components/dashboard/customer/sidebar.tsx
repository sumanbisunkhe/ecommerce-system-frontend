'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package2, ShoppingBag, Heart, UserCircle2 } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
  { name: 'Orders', href: '/customer/orders', icon: Package2 },
  { name: 'Cart', href: '/customer/cart', icon: ShoppingBag },
  { name: 'Wishlist', href: '/customer/wishlist', icon: Heart },
  { name: 'Profile', href: '/customer/profile', icon: UserCircle2 },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-16">
      <nav className="mt-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-5 w-5 flex-shrink-0 transition-colors`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
