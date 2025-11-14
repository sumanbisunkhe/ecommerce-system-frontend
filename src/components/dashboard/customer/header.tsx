'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  ShoppingCart, Package2, LayoutGrid, ChartColumnStacked, 
  Star, ChartLine, CreditCard, LogOut, Settings, 
  ChevronDown, Eye, Search, X, Menu
} from 'lucide-react';
import { Funnel_Sans, Fascinate } from "next/font/google";
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { BASE_URL } from '@/config/api';

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
  id?:number
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  email?: string;
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchRef = useRef<((query: string) => void) & { cancel: () => void } | null>(null);

  // Initialize search query from URL
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    setSearchQuery(urlSearchQuery);
  }, [searchParams]);

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.id) return;
      
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        const response = await fetch(`${BASE_URL}/carts/items/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setCartItemCount(result.data || 0);
        }
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };

    fetchCartCount();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdate', handleCartUpdate);
    return () => window.removeEventListener('cartUpdate', handleCartUpdate);
  }, [user]);

  useEffect(() => {
    debouncedSearchRef.current = debounce((query: string) => {
      if (pathname.startsWith('/customer/products')) {
        const url = query.trim()
          ? `/customer/products?search=${encodeURIComponent(query.trim())}`
          : '/customer/products';
        router.push(url);
      }
    }, 300);
    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, [router, pathname]);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearchRef.current?.cancel();

    if (searchQuery.trim()) {
      router.push(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (pathname.startsWith('/customer/products')) {
      router.push('/customer/products');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearchRef.current?.(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    debouncedSearchRef.current?.cancel();
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
    const firstInitial = user?.firstName?.[0] || '';
    const lastInitial = user?.lastName?.[0] || '';
    return (firstInitial + lastInitial) || 'U';
  };

  const isActivePath = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Main Header */}
      <header className={`${funnelSans.className} fixed top-0 left-0 right-0 z-50`}>
        {/* White background with subtle shadow */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"></div>
        
        <div className="relative h-16 sm:h-18 lg:h-20 px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-full max-w-8xl mx-auto">
            
            {/* Logo Section - Clean, professional, and stylish font */}
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/customer/products"
                className="flex items-center"
                aria-label="Home"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      ${fascinate.className}
                      text-blue-700 font-extrabold tracking-tight
                      text-lg sm:text-2xl lg:text-3xl
                      leading-none select-none
                    `}
                    style={{
                      letterSpacing: '-0.02em',
                    }}
                  >
                    HotShop<span className="text-pink-500">.com</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Spacer for balanced layout */}
            <div className="flex-1"></div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Search Bar - Cleaned up UI */}
              <div className="hidden md:block relative">
                <div ref={searchRef} className="relative flex justify-end">
                  <div className={`
                    relative transition-all duration-300
                    ${isSearchExpanded ? 'w-64 lg:w-80 xl:w-96' : 'w-40 lg:w-56'}
                  `}>
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center h-full">
                      {/* Search Icon - always visible, left-aligned */}
                      <span
                        className={`
                          absolute left-3 top-1/2 -translate-y-1/2
                          text-gray-400
                          pointer-events-none
                          transition-colors duration-200
                          ${isSearchFocused ? 'text-blue-600' : ''}
                        `}
                      >
                        <Search className="h-5 w-5" />
                      </span>
                      {/* Input */}
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        className={`
                          w-full pl-11 pr-8 py-2.5
                          rounded-lg border border-gray-200
                          bg-white
                          text-sm font-normal
                          text-gray-800 placeholder-gray-400
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                          outline-none shadow-sm
                          transition-all duration-200
                          ${isSearchExpanded ? '' : ''}
                        `}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                      />
                      {/* Clear Button */}
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent p-0.5 rounded-full transition"
                          tabIndex={0}
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              
              {/* Desktop Navigation - Clean and professional tabs */}
              <nav className="hidden xl:flex items-center space-x-1">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg
                        text-sm font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'bg-blue-600 text-white shadow border border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }
                      `}
                      style={{
                        boxShadow: isActive ? '0 2px 8px 0 rgba(37, 99, 235, 0.08)' : undefined,
                      }}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Action Icons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                
                {/* Cart - Clean and professional */}
                <Link
                  href="/customer/carts"
                  className="relative flex items-center justify-center p-2.5 sm:p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] px-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown - Clean and professional avatar */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 lg:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                    aria-label="Profile menu"
                  >
                    <div className="relative">
                      {user?.profilePictureUrl ? (
                        <Image
                          src={user.profilePictureUrl}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="h-9 w-9 lg:h-10 lg:w-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-400 transition-all duration-200 shadow"
                        />
                      ) : (
                        <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-blue-400 transition-all duration-200 shadow">
                          <span className="text-base font-semibold text-gray-600">
                            {getInitials(user)}
                          </span>
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 lg:h-3.5 lg:w-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                   
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200 hidden sm:block ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Enhanced Dropdown Menu - Responsive positioning */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 lg:mt-3 w-56 sm:w-60 lg:w-64 rounded-xl lg:rounded-2xl bg-white backdrop-blur-xl py-2 
                                  shadow-2xl shadow-black/10 ring-1 ring-gray-200 
                                  transform transition-all duration-200 origin-top-right
                                  border border-gray-100">
                      
                      {/* User Info Header */}
                      <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user?.firstName} {user?.lastName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{user?.email || 'Member'}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/customer/profile"
                          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium text-gray-700 
                                   hover:bg-blue-50 hover:text-blue-700 transition-all duration-200
                                   rounded-lg mx-2"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Eye className="h-4 w-4" />
                          View Profile
                        </Link>
                        <Link
                          href="/customer/settings"
                          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium text-gray-700 
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
                          className="flex w-full items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-left text-sm font-medium 
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
                  className="xl:hidden p-2 sm:p-2.5 lg:p-3 text-gray-600 hover:text-gray-800 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Enhanced Responsiveness */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div ref={mobileMenuRef} className="fixed right-0 top-0 h-full w-[85vw] sm:w-80 md:w-96 bg-white backdrop-blur-xl shadow-2xl border-l border-gray-200 overflow-y-auto flex flex-col">
            <div className="p-4 sm:p-6 pt-20 sm:pt-24 flex-1 relative flex flex-col">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-lg border border-gray-200 hover:border-blue-400 bg-white text-gray-600 hover:text-blue-600 shadow transition-all duration-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Mobile Search - Cleaned up UI */}
              <div className="mb-4 sm:mb-6 md:hidden">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-11 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all duration-200"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent p-0.5 rounded-full transition"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Mobile Navigation - Clean and professional tabs */}
              <nav className="space-y-1.5 sm:space-y-2">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'bg-blue-600 text-white shadow border border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }
                      `}
                      style={{
                        boxShadow: isActive ? '0 2px 8px 0 rgba(37, 99, 235, 0.08)' : undefined,
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Close Button at bottom center */}
              <div className="flex-grow"></div>
              <div className="w-full flex justify-center pb-6 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-400 shadow transition-all duration-200"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                  <span className="font-medium text-base">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header - Responsive */}
      {/* <div className="h-16 sm:h-18 lg:h-20"></div> */}
    </>
  );
}