'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, Settings, LogOut, Eye, ShieldCheck, Camera, KeyRound, ChevronRight } from 'lucide-react';

// Google Fonts
import { Markazi_Text } from 'next/font/google';
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
import { Funnel_Sans } from "next/font/google"

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

interface AdminHeaderProps {
  user: any;
  isSidebarCollapsed?: boolean;
  sidebarWidth?: number;
}

export default function AdminHeader({ user: initialUser, isSidebarCollapsed = false, sidebarWidth = 256 }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const [user, setUser] = useState(initialUser);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail);
    };
    window.addEventListener('userUpdate', handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener('userUpdate', handleUserUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/auth/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setShowSettingsSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSectionTitle = () => {
    if (pathname.startsWith('/admin/analytics')) return 'Analytics';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    if (pathname.startsWith('/admin/categories')) return 'Category Management';
    if (pathname.startsWith('/admin/products')) return 'Product Management';
    if (pathname.startsWith('/admin/orders')) return 'Order Management';
    if (pathname.startsWith('/admin/settings')) return 'Settings';
    return '';
  };

  const handleDropdownItemClick = () => {
    setIsProfileOpen(false);
    setShowSettingsSubmenu(false);
  };

  return (
    <header 
      style={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        left: `${sidebarWidth}px`,
        transition: 'left 0.3s ease-in-out'
      }}
      className="bg-white shadow-sm z-40">
      <div className="h-16 px-6 flex items-center justify-between gap-x-4 w-full">
        {/* Dynamic Section Title */}
        <div className={`${markaziText.className} text-2xl font-semibold text-black`}>
          {getSectionTitle()}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="relative">
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                  key={user.profilePictureUrl}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                <ShieldCheck className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`${funnelSans.className} absolute right-0 mt-2 w-52 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top ${
              isProfileOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
            }`}
          >
            <Link
              href={`/admin/users/${user?.id}?isCurrentUser=true`}
              onClick={handleDropdownItemClick}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </Link>

            {/* Settings with nested submenu */}
            <div>
              <button
                onClick={() => setShowSettingsSubmenu(!showSettingsSubmenu)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </span>
                <ChevronRight
                  className={`h-4 w-4 text-gray-400 transition-transform ${showSettingsSubmenu ? 'rotate-90' : ''}`}
                />
              </button>

              {showSettingsSubmenu && (
                <div className="pl-6">
                  <Link
                    href="/admin/settings?tab=profile"
                    onClick={handleDropdownItemClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4" />
                    Change Picture
                  </Link>
                  <Link
                    href="/admin/settings?tab=security"
                    onClick={handleDropdownItemClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleDropdownItemClick();
                handleLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
