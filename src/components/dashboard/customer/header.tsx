'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  ShoppingCart, Package2, LayoutGrid, ChartColumnStacked, 
  Star, ChartLine, CreditCard, LogOut, Settings, 
  ChevronDown, Eye, Search, X, Menu, Bell, Heart
} from 'lucide-react';
import { Funnel_Sans, Fascinate } from "next/font/google";
import debounce from 'lodash/debounce';

const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const fascinate = Fascinate({ subsets: ["latin"], weight: "400" });

const NAVIGATION_ITEMS = [
  { name: 'Products', href: '/customer/products', icon: LayoutGrid },
  { name: 'Categories', href: '/customer/categories', icon: ChartColumnStacked },
  { name: 'Orders', href: '/customer/orders', icon: Package2 },
  { name: 'Trends', href: '/customer/trends', icon: Star },
  { name: 'Payments', href: '/customer/payment', icon: CreditCard },
  { name: 'Analytics', href: '/customer/analytics', icon: ChartLine },
];

interface User {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

interface CustomerHeaderProps {
  user: User | null;
}

export default function CustomerHeader({ user: initialUser }: CustomerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Initialize search query from URL
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    setSearchQuery(urlSearchQuery);
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (pathname.startsWith('/customer/products')) {
        const url = query.trim() 
          ? `/customer/products?search=${encodeURIComponent(query.trim())}`
          : '/customer/products';
        router.push(url);
      }
    }, 300),
    [router, pathname]
  );

  // Cleanup debounce
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // User update listener
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener('userUpdate', handleUserUpdate as EventListener);
    return () => window.removeEventListener('userUpdate', handleUserUpdate as EventListener);
  }, []);

  // Click outside handler
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel();
    
    if (searchQuery.trim()) {
      router.push(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (pathname.startsWith('/customer/products')) {
      router.push('/customer/products');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    debouncedSearch.cancel();
    if (pathname.startsWith('/customer/products')) {
      router.push('/customer/products');
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/auth/login');
  };

  const getInitials = (user: User | null) => {
    return user?.firstName?.[0] + user?.lastName?.[0] || 'U';
  };

  const isActivePath = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Main Header */}
      <header className={`${funnelSans.className} fixed top-0 left-0 right-0 z-50`}>
        {/* White background with subtle shadow */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"></div>
        
        <div className="relative h-20 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full max-w-8xl mx-auto">
            
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/customer/products"
                className="group relative flex items-center"
              >
                <div className="relative">
                  <span className={`
                    ${fascinate.className}
                    text-black text-2xl font-bold tracking-wider
                    px-6 py-3 rounded-2xl shadow-2xl
                    border border-gray-200 
                    
                  `}>
                    HoT🔥sHoP
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar - Enhanced */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full group">
                <div className={`
                  relative transition-all duration-300 ease-out
                  ${isSearchFocused ? 'scale-[1.02]' : ''}
                `}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <Search className={`
                      absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 
                      transition-colors duration-200
                      ${isSearchFocused ? 'text-blue-600' : 'text-gray-400'}
                    `} />
                    
                    <input
                      type="text"
                      placeholder="Search products, brands, and more..."
                      className={`
                        w-full pl-12 pr-12 py-4 rounded-2xl text-sm font-medium
                        bg-gray-50 backdrop-blur-md border border-gray-200
                        text-gray-800 placeholder-gray-500
                        focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                        hover:bg-gray-100 hover:border-gray-300
                        outline-none transition-all duration-300 ease-out
                        shadow-sm hover:shadow-md focus:shadow-lg
                      `}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                    />
                    
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                                 rounded-full p-1 transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              
              {/* Desktop Navigation */}
              <nav className="hidden xl:flex items-center space-x-1">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative group flex flex-col items-center px-4 py-3 rounded-xl
                        text-xs font-medium transition-all duration-300 ease-out
                        min-w-[72px] hover:scale-105
                        ${isActive
                          ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 border border-blue-500/20'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }
                      `}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"></div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg"></div>
                        </>
                      )}
                      <Icon className={`h-5 w-5 mb-1 relative z-10 ${isActive ? 'drop-shadow-lg' : ''}`} />
                      <span className="relative z-10 font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Action Icons */}
              <div className="flex items-center space-x-2">
                
              
                {/* Cart */}
                <Link
                  href="/customer/carts"
                  className="relative p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">5</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="relative">
                      {user?.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt="Profile"
                          className="h-10 w-10 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200 shadow-md"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 
                                      flex items-center justify-center border-2 border-gray-200 
                                      group-hover:border-blue-400 transition-all duration-200 shadow-md">
                          <span className="text-sm font-bold text-white drop-shadow-sm">
                            {getInitials(user)}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.firstName} {user?.lastName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Premium Member</p>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white backdrop-blur-xl py-2 
                                  shadow-2xl shadow-black/10 ring-1 ring-gray-200 
                                  transform transition-all duration-200 origin-top-right
                                  border border-gray-100">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.firstName} {user?.lastName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Premium Member</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/customer/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 
                                   hover:bg-blue-50 hover:text-blue-700 transition-all duration-200
                                   rounded-lg mx-2"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Eye className="h-4 w-4" />
                          View Profile
                        </Link>
                        <Link
                          href="/customer/settings"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 
                                   hover:bg-blue-50 hover:text-blue-700 transition-all duration-200
                                   rounded-lg mx-2"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium 
                                   text-red-600 hover:bg-red-50 transition-all duration-200
                                   rounded-lg mx-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="xl:hidden p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div ref={mobileMenuRef} className="fixed right-0 top-0 h-full w-80 bg-white backdrop-blur-xl shadow-2xl border-l border-gray-200">
            <div className="p-6 pt-24">
              
              {/* Mobile Search */}
              <div className="mb-6 md:hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                             text-gray-800 placeholder-gray-500 text-sm"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200 overflow-hidden
                        ${isActive
                          ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 border border-blue-500/20'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                          <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full"></div>
                        </>
                      )}
                      <Icon className={`h-5 w-5 relative z-10 ${isActive ? 'drop-shadow-sm' : ''}`} />
                      <span className="relative z-10 font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      {/* <div className="h-12"></div> */}
    </>
  );
}