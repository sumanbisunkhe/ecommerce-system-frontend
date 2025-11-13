/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package2, ArrowUpDown, Filter, Loader2, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';
import Link from 'next/link';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface Filters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

interface Recommendation {
  id: number;
  productId: number;
  productName: string;
  type: string;
  userId: number;
  score: number;
}

interface RecommendedProduct extends Product {
  recommendationType: string;
  recommendationScore: number;
}


interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    size: 9,
    number: 1,  // 1-based for both frontend and backend
    totalElements: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Detect if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize filters with category from URL
  useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, categoryId: Number(categoryParam) }));
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          const userId = userData.id;
          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

          // Fetch recommendations
          const recResponse = await fetch(
            `${BASE_URL}/recommendations/user/${userId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }
          );

          if (!recResponse.ok) {
            throw new Error('Failed to fetch recommendations');
          }

          const recData = await recResponse.json();
          if (recData.success) {
            // Fetch product details for each recommendation
            const productPromises = recData.data.map(async (rec: Recommendation) => {
              const prodResponse = await fetch(
                `${BASE_URL}/products/${rec.productId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  }
                }
              );
              
              if (!prodResponse.ok) {
                throw new Error(`Failed to fetch product ${rec.productId}`);
              }

              const prodData = await prodResponse.json();
              return {
                ...prodData.data,
                recommendationType: rec.type,
                recommendationScore: rec.score
              };
            });

            const products = await Promise.all(productPromises);
            setRecommendedProducts(products);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecommendedProducts([]);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const response = await fetch(
          `${BASE_URL}/analytics/system`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        if (data.success && data.data) {
          setPopularProducts(data.data.popularProducts || []);
          setNewProducts(data.data.newProducts || []);
        }
      } catch {
        setPopularProducts([]);
        setNewProducts([]);
      }
    };

    fetchRecommendations();
    fetchAnalytics();
  }, []);

  // Reset to first page when search term or filters change
  useEffect(() => {
    setPageInfo(prev => ({ ...prev, number: 1 }));
    setProducts([]); // Clear products for fresh start
  }, [searchTerm, sortBy, sortOrder, filters]);

  // Fetch products function
  const fetchProducts = useCallback(async (page: number, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('search', searchTerm?.trim() || '');
      
      const pageNumber = Math.max(1, page);
      queryParams.append('page', pageNumber.toString());
      queryParams.append('size', pageInfo.size.toString());
      
      queryParams.append('sortBy', sortBy);
      queryParams.append('ascending', (sortOrder === 'asc').toString());
      
      queryParams.append('active', 'true');

      if (filters.minPrice != null && !isNaN(filters.minPrice)) {
        queryParams.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice != null && !isNaN(filters.maxPrice)) {
        queryParams.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.minStock != null && !isNaN(filters.minStock)) {
        queryParams.append('minStock', filters.minStock.toString());
      }
      if (filters.maxStock != null && !isNaN(filters.maxStock)) {
        queryParams.append('maxStock', filters.maxStock.toString());
      }
      if (filters.categoryId != null && !isNaN(filters.categoryId)) {
        queryParams.append('categoryId', filters.categoryId.toString());
      }

      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(
        `${BASE_URL}/products/all?${queryParams}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        if (append) {
          // Filter out duplicates by creating a Set of existing IDs
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = data.data.content.filter((p: Product) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        } else {
          setProducts(data.data.content);
        }
        setPageInfo(prev => ({
          ...prev,
          number: pageNumber,
          totalElements: data.data.page.totalElements,
          totalPages: data.data.page.totalPages,
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load products');
      if (!append) {
        setProducts([]);
        setPageInfo(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
        }));
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [pageInfo.size, sortBy, sortOrder, searchTerm, filters]);

  // Fetch products when relevant parameters change
  useEffect(() => {
    fetchProducts(pageInfo.number, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo.number, pageInfo.size, sortBy, sortOrder, searchTerm, JSON.stringify(filters)]);

  // Infinite scroll setup for mobile
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (
        firstEntry.isIntersecting &&
        !isLoadingMore &&
        !isLoading &&
        pageInfo.number < pageInfo.totalPages
      ) {
        const nextPage = pageInfo.number + 1;
        setPageInfo(prev => ({ ...prev, number: nextPage }));
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, isLoadingMore, isLoading, pageInfo.number, pageInfo.totalPages]);

  // Separate effect for triggering fetch on page change from infinite scroll
  useEffect(() => {
    if (isMobile && pageInfo.number > 1) {
      fetchProducts(pageInfo.number, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo.number]);

  const handleFilterChange = (filterUpdate: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...filterUpdate }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Handle page change - use 1-based for both UI and backend
  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, page);
    setPageInfo(prev => ({ ...prev, number: validPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCategories = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`${BASE_URL}/categories/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Add useEffect for fetching categories
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 md:pt-28">
        <NotificationProvider />
        
        {/* Search Results Header */}
        {searchTerm && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-6 shadow-lg shadow-indigo-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-indigo-100 mb-1">Search Results</p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    "{searchTerm}"
                  </h2>
                </div>
                <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'result' : 'results'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200/50 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {searchTerm ? 'Search Results' : 'All Products'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Find your perfect items from our collection</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  Object.keys(filters).length > 0 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Filters</span>
                {Object.keys(filters).length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs bg-white/30 backdrop-blur-sm rounded-full font-bold">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>

              <select
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 border-0 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="updatedAt">Recently Updated</option>
              </select>
              
              <button
                onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
                className="p-2 sm:p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Stock Range */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Stock Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minStock || ''}
                      onChange={(e) => handleFilterChange({ minStock: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxStock || ''}
                      onChange={(e) => handleFilterChange({ maxStock: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Category</label>
                  <select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleFilterChange({ 
                      categoryId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all w-full justify-center"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Products Grid - 70% width */}
          <div className="flex-1">
            {isLoading && products.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Loading amazing products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 bg-white/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200 p-8 sm:p-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <Package2 className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {searchTerm ? 'No products found' : 'No products available'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md">
                  {searchTerm 
                    ? `Try adjusting your search or filters to find what you're looking for.`
                    : 'Check back later for new products.'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={`product-${product.id}`} product={product} />
                  ))}
                </div>

                {/* Infinite Scroll Trigger for Mobile */}
                {isMobile && pageInfo.number < pageInfo.totalPages && (
                  <div ref={loadMoreRef} className="py-8 sm:py-12 flex justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-indigo-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Loading more...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Pagination - Only show on desktop */}
            {!isMobile && !isLoading && pageInfo.totalPages > 0 && (
              <div className="mt-8 sm:mt-12 flex items-center justify-center">
                <Pagination
                  currentPage={pageInfo.number}
                  totalPages={pageInfo.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar - 30% width */}
          <div className="lg:w-80 space-y-4 sm:space-y-6">
            {/* Recommended Products */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg sm:text-xl">⭐</span>
                  Recommended Products
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {recommendedProducts.length === 0 ? (
                  <div className="p-3 sm:p-4 text-gray-500 text-xs sm:text-sm">No recommendations available.</div>
                ) : (
                  recommendedProducts.map((product) => (
                    <RecommendationCard key={`rec-${product.id}`} product={product} />
                  ))
                )
                }
              </div>
            </div>

            {/* Popular Products */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 sm:p-4">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg sm:text-xl">🔥</span>
                  Popular Products
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {popularProducts.length === 0 ? (
                  <div className="p-3 sm:p-4 text-gray-500 text-xs sm:text-sm">No popular products found.</div>
                ) : (
                  popularProducts.map((product) => (
                    <CompactProductCard key={`popular-${product.id}`} product={product} />
                  ))
                )}
              </div>
            </div>

            {/* New Products */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 sm:p-4">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg sm:text-xl">✨</span>
                  New Arrivals
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {newProducts.length === 0 ? (
                  <div className="p-3 sm:p-4 text-gray-500 text-xs sm:text-sm">No new products found.</div>
                ) : (
                  newProducts.map((product) => (
                    <CompactProductCard key={`new-${product.id}`} product={product} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsAddingToCart(true);
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1];

      if (!userCookie) throw new Error('User not found');

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const userId = userData.id;
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(
        `${BASE_URL}/carts/${userId}/add/${product.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to add to cart');

      const data = await response.json();
      if (data.success) {
        notify.success('Product added to cart');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      notify.error(error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Link 
      href={`/customer/products/${product.id}`} 
      className="group block"
    >
      <div className="relative h-full bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-transparent overflow-hidden hover:-translate-y-2">
        <div className="relative pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <Image
            src={product.imageUrl || '/product-placeholder.png'}
            alt={product.name}
            fill
            className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4 md:p-6 group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">{product.description}</p>
          
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Price</p>
              <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                रु{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={addToCart}
              disabled={isAddingToCart}
              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white rounded-lg sm:rounded-xl
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:from-indigo-700 hover:to-purple-700
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                transform hover:scale-105 disabled:transform-none
                transition-all duration-300 shadow-lg shadow-indigo-500/30
                flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompactProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/customer/products/${product.id}`} className="block">
      <div className="flex gap-2 sm:gap-3 items-center p-3 sm:p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
        <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <Image
            src={product.imageUrl || '/product-placeholder.png'}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            रु{product.price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </Link>
  );
}

function RecommendationCard({ product }: { product: RecommendedProduct }) {
  return (
    <Link href={`/customer/products/${product.id}`} className="block">
      <div className="flex gap-2 sm:gap-3 items-center p-3 sm:p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
        <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <Image
            src={product.imageUrl || '/product-placeholder.png'}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            रु{product.price.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 truncate">
            {product.recommendationType.toLowerCase().replace('_', ' ')} • 
            Score: {(product.recommendationScore * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </Link>
  );
}