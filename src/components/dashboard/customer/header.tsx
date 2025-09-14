'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart, Package2, LayoutGrid, TableColumnsSplit, Sparkles, ChartNoAxesCombined, CreditCard, LogOut, Settings, ChevronDown, Eye, Search, X } from 'lucide-react';
import { Funnel_Sans, Fascinate } from "next/font/google";
import debounce from 'lodash/debounce';

const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });
const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})

const navigation = [
  { name: 'Products', href: '/customer/products', icon: LayoutGrid },
  { name: 'Categories', href: '/customer/categories', icon: TableColumnsSplit },
  { name: 'Orders', href: '/customer/orders', icon: Package2 },
  { name: 'Trends', href: '/customer/recommendations', icon: Sparkles },
  { name: 'Payments', href: '/customer/payments', icon: CreditCard },
  { name: 'Analytics', href: '/customer/analytics', icon: ChartNoAxesCombined },
];

interface CustomerHeaderProps {
  user: any;
}

export default function CustomerHeader({ user: initialUser }: CustomerHeaderProps) {
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
  }, []);

  // Memoize the debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (pathname.startsWith('/customer/products')) {
        if (query.trim()) {
          router.push(`/customer/products?search=${encodeURIComponent(query.trim())}`);
        } else {
          router.push('/customer/products');
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
      router.push(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (pathname.startsWith('/customer/products')) {
      router.push('/customer/products');
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Update search field when URL changes
  useEffect(() => {
    if (pathname.startsWith('/customer/products')) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchFromUrl = urlParams.get('search') || '';
      setSearchQuery(searchFromUrl);
    }
  }, [pathname]);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

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
    <header className={`${funnelSans.className} fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg z-50 border-b border-blue-700`}>
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/customer/products" 
          className={`${fascinate.className} text-2xl font-bold text-white flex items-center transition-transform hover:scale-105`}
        >
         <span
  className={`${fascinate.className} 
              text-black 
              text-xl 
              bg-white 
              px-4 
              py-6
              font-extrabold 
              tracking-wider 
              border-2 
              border-black 
              rounded-lg 
              shadow-lg 
              drop-shadow-md 
              hover:scale-103 
              transition-transform 
              duration-300`}>
  HoT🔥sHoP
</span>

        </Link>

        {/* Updated Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, and categories..."
                className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-gray-800 placeholder-gray-500 text-sm transition-all"
                value={searchQuery}
                onChange={handleSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    debouncedSearch.cancel();
                    if (pathname.startsWith('/customer/products')) {
                      router.push('/customer/products');
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

        <div className="flex items-center gap-10">
          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center p-2 text-sm font-medium rounded-md transition-all duration-200 group ${pathname.startsWith(item.href)
                  ? 'text-amber-400 bg-white/10'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </div>

        

          {/* Cart Icon */}
          <Link
            href="/customer/carts"
            className="relative p-2 text-blue-100 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute top-1 right-1.5 w-4 h-4 bg-amber-400 text-xs font-bold text-blue-900 rounded-full flex items-center justify-center">
              3
            </span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
            >
              <div className="relative">
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover border-2 border-white/30 group-hover:border-amber-400 transition-colors"
                    key={user.profilePictureUrl}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center border-2 border-white/30 group-hover:border-amber-400 transition-colors">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-blue-200">Premium Member</p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-blue-200 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-2 w-56 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 transform transition-all duration-200 origin-top ${isProfileOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                }`}
            >
                         
              <Link
                href="/customer/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Link>
              <Link
                href="/customer/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}