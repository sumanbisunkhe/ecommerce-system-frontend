'use client';

import { logout } from '@/lib/auth';

interface CustomerHeaderProps {
  user: any;
}

export default function CustomerHeader({ user }: CustomerHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">My Account</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, {user?.firstName}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}