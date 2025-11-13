/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart,LayoutGrid, ChartColumnStacked,LogOut, Settings, ChevronDown, Eye, Search, X, Menu, User } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`${funnelSans.className} fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Always on the left */}
          <Link href="/" className={`${fascinate.className} font-bold text-lg sm:text-xl text-gray-900`}>
            HoT🔥sHoP
          </Link>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
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

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Navigation - Hidden on small/medium, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4">
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
                {/* Cart Icon - Hidden on mobile when logged in */}
                <Link
                  href="/cart"
                  className="hidden sm:flex relative p-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>

                {/* Profile Dropdown - Hidden on mobile */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    {user?.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-gray-300"
                        key={user.profilePictureUrl}
                      />
                    ) : (
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-medium text-white">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-600 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
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

                {/* Mobile: Menu Button for logged in users */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </>
            ) : (
              <>
                {/* Auth Buttons - Show only Login on mobile, both on desktop */}
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/auth/login" 
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-gray-700 rounded-md border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-xs sm:text-sm whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="hidden sm:inline-block px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-white font-medium text-xs sm:text-sm whitespace-nowrap
                      bg-gradient-to-r from-indigo-600 to-purple-600
                      hover:from-indigo-700 hover:to-purple-700
                      transition-all duration-200 shadow-md
                      hover:shadow-lg hover:-translate-y-0.5
                      active:shadow-inner active:translate-y-0"
                  >
                    Register
                  </Link>
                </div>

                {/* Mobile: Menu Button for non-logged in users */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Mobile Sidebar Menu */}
        <div
          ref={mobileMenuRef}
          className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } overflow-y-auto z-50`}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <h2 className={`${fascinate.className} text-xl font-bold text-gray-900`}>Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-4 py-6 space-y-6">
            {/* User Profile Section - Mobile */}
            {user && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  {user?.profilePictureUrl ? (
                    <Image
                      src={user.profilePictureUrl}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                      key={user.profilePictureUrl}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-lg font-bold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs opacity-90 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View Profile
                </Link>
              </div>
            )}

            {/* Mobile Search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Search</label>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800 placeholder-gray-400 text-sm transition-all shadow-sm"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Navigation</label>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                      pathname.startsWith(item.href) 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                      pathname === '/cart'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Shopping Cart</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Mobile User Actions */}
            {user && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Account</label>
                <div className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 font-medium transition-all"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 font-medium transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Guest Actions */}
            {!user && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
                  <User className="h-10 w-10 mx-auto mb-2 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Join HoT🔥sHoP</h3>
                  <p className="text-xs text-gray-600 mb-3">Sign in to access your cart and orders</p>
                  <div className="flex gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 px-4 py-2.5 text-gray-700 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-white font-medium text-sm transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}