'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package2, ArrowUpDown, Filter, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';
import Link from 'next/link';

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

// Add new interface for cart response
interface CartResponse {
  id: number;
  userId: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalItems: number;
  totalPrice: number;
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

  // Initialize filters with category from URL
  useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, categoryId: Number(categoryParam) }));
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Only add search param if it exists and is not empty
      // if (searchTerm?.trim()) {
      //   queryParams.append('search', searchTerm.trim());
      // }
      queryParams.append('search', searchTerm?.trim() || '');
      
      // Use 1-based page number (backend expects this and converts to 0-based internally)
      const pageNumber = Math.max(1, pageInfo.number);
      queryParams.append('page', pageNumber.toString());
      queryParams.append('size', pageInfo.size.toString());
      
      // Add sorting params
      queryParams.append('sortBy', sortBy);
      queryParams.append('ascending', (sortOrder === 'asc').toString());
      
      // Always include active status
      queryParams.append('active', 'true');

      // Add numeric filters only if they are valid numbers
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
        `http://localhost:8080/products/all?${queryParams}`,
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
        setProducts(data.data.content);
        setPageInfo(prev => ({
          ...prev,
          number: pageNumber, // Keep the 1-based page number
          totalElements: data.data.page.totalElements,
          totalPages: data.data.page.totalPages,
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load products');
      setProducts([]);
      setPageInfo(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  };

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
            `http://localhost:8080/recommendations/user/${userId}`,
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
                `http://localhost:8080/products/${rec.productId}`,
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
          'http://localhost:8080/analytics/system',
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
      } catch (error) {
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
  }, [searchTerm, sortBy, sortOrder, filters]);

  // Fetch products when any relevant parameter changes
  useEffect(() => {
    fetchProducts();
  }, [pageInfo.number, pageInfo.size, sortBy, sortOrder, searchTerm, filters]);

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
  };

  // Add fetchCategories function
  const fetchCategories = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:8080/categories/all', {
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
    <div className={`${funnelSans.className} container mx-auto px-4 py-8 pt-24`}>
      <NotificationProvider />
      
      {/* Search Results Header */}
      {searchTerm && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Search results for: <span className="text-blue-600">"{searchTerm}"</span>
          </h2>
          <span className="text-sm text-gray-500">
            {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'result' : 'results'}
          </span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {searchTerm ? 'Search Results' : 'All Products'}
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                Object.keys(filters).length > 0 ? 'border-blue-500 text-blue-600' : 'border-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price</option>
              <option value="name">Name</option>
              <option value="updatedAt">Recently Updated</option>
            </select>
            
            <button
              onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Stock Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minStock || ''}
                    onChange={(e) => handleFilterChange({ minStock: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxStock || ''}
                    onChange={(e) => handleFilterChange({ maxStock: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange({ 
                    categoryId: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Products Grid - 70% width */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Package2 className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `Try adjusting your search or filters to find what you're looking for.`
                  : 'Check back later for new products.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pageInfo.totalPages > 0 && (
            <div className="mt-8 flex items-center justify-center">
              <Pagination
                currentPage={pageInfo.number}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - 30% width */}
        <div className="lg:w-80 space-y-6">
          {/* Recommended Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recommended Products</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendedProducts.map((product) => (
                <RecommendationCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Popular Products</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {popularProducts.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No popular products found.</div>
              ) : (
                popularProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>

          {/* New Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">New Products</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {newProducts.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No new products found.</div>
              ) : (
                newProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))
              )}
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
    e.preventDefault(); // Prevent navigation when clicking the add to cart button
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
        `http://localhost:8080/carts/${userId}/add/${product.id}`,
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
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
    >
      <div className="relative pt-[100%]">
        <Image
          src={product.imageUrl || '/product-placeholder.png'}
          alt={product.name}
          fill
          className="absolute inset-0 w-full h-full object-contain bg-gray-50 p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            रु{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={addToCart}
            disabled={isAddingToCart}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
              hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200
              disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none
              flex items-center gap-2`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

function CompactProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/customer/products/${product.id}`}>
      <div className="flex gap-3 items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={product.imageUrl || '/product-placeholder.png'}
            alt={product.name}
            fill
            className="object-contain p-2 bg-gray-50"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-blue-600">रु{product.price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </Link>
  );
}

function RecommendationCard({ product }: { product: RecommendedProduct }) {
  return (
    <Link href={`/customer/products/${product.id}`}>
      <div className="flex gap-3 items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={product.imageUrl || '/product-placeholder.png'}
            alt={product.name}
            fill
            className="object-contain p-2 bg-gray-50"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-blue-600">
            रु{product.price.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">
            {product.recommendationType.toLowerCase().replace('_', ' ')} • 
            Score: {(product.recommendationScore * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </Link>
  );
}