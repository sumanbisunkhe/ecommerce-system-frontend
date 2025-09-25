/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart,LayoutGrid, ChartColumnStacked,LogOut, Settings, ChevronDown, Eye, Search, X } from 'lucide-react';
import { Funnel_Sans, Fascinate } from "next/font/google";
import debounce from 'lodash/debounce';
import Image from 'next/image';

const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });
const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})

const navigation = [
  { name: 'Products', href: '/products', icon: LayoutGrid },
  { name: 'Categories', href: '/categories', icon: ChartColumnStacked },
];

interface HeaderProps {
  user?: any;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const searchParams = useSearchParams();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize search query from URL on mount
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Fix the debounced search function with proper dependencies
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (pathname.startsWith('/products')) {
        if (query.trim()) {
          router.push(`/products?search=${encodeURIComponent(query.trim())}`);
        } else {
          router.push('/products');
        }
      }
    }, 300),
    [router, pathname]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (pathname.startsWith('/products')) {
      router.push('/products');
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Update search field when URL changes
  useEffect(() => {
    if (pathname.startsWith('/products')) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchFromUrl = urlParams.get('search') || '';
      setSearchQuery(searchFromUrl);
    }
  }, [pathname]);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Add this effect to listen for user updates
  useEffect(() => {
    const handleUserUpdate = (event: any) => {
      setUser(event.detail);
    };

    window.addEventListener('userUpdate', handleUserUpdate);
    return () => window.removeEventListener('userUpdate', handleUserUpdate);
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/auth/login');
  };

  // Update input to handle Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`${funnelSans.className} fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200`}>
      <div className="max-w-8xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className={`${fascinate.className} font-bold text-xl text-gray-900`}>
            HoT🔥sHoP
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-md bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-500 text-sm transition-all"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      debouncedSearch.cancel();
                      if (pathname.startsWith('/products')) {
                        router.push('/products');
                      }
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1 text-gray-600 hover:text-gray-900 ${pathname.startsWith(item.href) ? 'text-gray-900 font-medium' : ''}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Authentication Links or User Profile */}
            {user ? (
              <>
                {/* Cart Icon */}
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    {user?.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover border border-gray-300"
                        key={user.profilePictureUrl}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top ${isProfileOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                      }`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Eye className="h-4 w-4" />
                      View Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-sm"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 rounded-md text-white font-medium text-sm
                    bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:from-indigo-700 hover:to-purple-700
                    transition-all duration-200 shadow-md
                    hover:shadow-lg hover:-translate-y-0.5
                    active:shadow-inner active:translate-y-0"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}