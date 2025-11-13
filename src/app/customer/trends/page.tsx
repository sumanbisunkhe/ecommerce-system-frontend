/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { 
  TrendingUp, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Zap, 
  ShoppingBag, 
  Heart,
  Package,
  Clock,
  Users,
  Grid3x3,
  LayoutGrid
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

interface RecommendedProduct extends Product {
  recommendationType: 'COLLABORATIVE' | 'CONTENT_BASED';
  recommendationScore: number;
}

const ProductSkeleton = () => (
  <div className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const ProductSection = ({ title, icon: Icon, products, type }: any) => {
  const sectionConfig = {
    recommended: {
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      badge: 'bg-gradient-to-r from-amber-500 to-orange-600',
      emoji: '⚡',
      label: 'For You'
    },
    popular: {
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
      badge: 'bg-gradient-to-r from-violet-500 to-purple-600',
      emoji: '🔥',
      label: 'Trending'
    },
    new: {
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      emoji: '✨',
      label: 'New'
    }
  };

  const config = sectionConfig[type as keyof typeof sectionConfig];
  
  // Limit to 4 products
  const displayProducts = products.slice(0, 4);

  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`${config.iconBg} p-3 rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <span className="text-xl">{config.emoji}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {type === 'recommended' && 'Curated based on your preferences'}
              {type === 'popular' && 'Most loved by our community'}
              {type === 'new' && 'Latest additions to our catalog'}
            </p>
          </div>
        </div>
        
        {products.length > 4 && (
          <Link 
            href="/customer/products"
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group/btn"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    
      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className={`relative rounded-2xl bg-gradient-to-br ${config.bgGradient} border border-gray-200 p-12 text-center`}>
          <div className={`${config.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products available</h3>
          <p className="text-sm text-gray-500">Check back soon for new items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayProducts.map((product: any) => (
            <Link
              key={product.id}
              href={`/customer/products/${product.id}`}
              className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 ${config.badge} rounded-full shadow-lg`}>
                  {type === 'recommended' && <Zap className="h-3 w-3 text-white fill-white" strokeWidth={2.5} />}
                  {type === 'new' && <Sparkles className="h-3 w-3 text-white" strokeWidth={2.5} />}
                  {type === 'popular' && <TrendingUp className="h-3 w-3 text-white" strokeWidth={2.5} />}
                  <span className="text-xs font-bold text-white">{config.label}</span>
                </div>
              </div>

              {/* Wishlist Button */}
              <button 
                onClick={(e) => e.preventDefault()}
                className="absolute top-3 left-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 hover:fill-red-500 transition-colors" strokeWidth={2.5} />
              </button>

              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image
                  src={product.imageUrl || '/product-placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {product.description}
                </p>
                
                {/* Price & Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      रु {product.price.toLocaleString('en-IN')}
                    </div>
                    {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-amber-500" strokeWidth={2.5} />
                        <span className="text-xs text-amber-600 font-medium">
                          {product.stockQuantity} left
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-blue-500 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Recommendation Info */}
                {type === 'recommended' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gray-400" strokeWidth={2.5} />
                      <span className="text-xs text-gray-500 font-medium">
                        {product.recommendationType === 'COLLABORATIVE' 
                          ? 'Popular with similar users' 
                          : 'Matches your interests'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom Accent */}
              <div className={`h-1 bg-gradient-to-r ${config.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default function TrendsPage() {
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        // Fetch system analytics for popular and new products
        const analyticsResp = await fetch(`${BASE_URL}/analytics/system`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (analyticsResp.ok) {
          const analytics = await analyticsResp.json();
          if (analytics.success) {
            setPopularProducts(analytics.data.popularProducts || []);
            setNewProducts(analytics.data.newProducts || []);
          }
        }

        // Fetch personalized recommendations
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (userCookie) {
          const userData = JSON.parse(decodeURIComponent(userCookie));
          const userId = userData.id;

          const recResp = await fetch(`${BASE_URL}/recommendations/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (recResp.ok) {
            const recData = await recResp.json();
            if (recData.success) {
              const prodDetails = await Promise.all(
                recData.data.map(async (rec: any) => {
                  const pResp = await fetch(`${BASE_URL}/products/${rec.productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const pData = await pResp.json();
                  return {
                    ...pData.data,
                    recommendationType: rec.type,
                    recommendationScore: rec.score,
                  } as RecommendedProduct;
                })
              );
              setRecommendedProducts(prodDetails);
            }
          }
        }
      } catch {
        notify.error('Failed to fetch trending products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (isLoading) {
    return (
      <div className={`${funnelSans.className} min-h-screen bg-gray-50 pt-20`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading Hero */}
          <div className="mb-12 text-center">
            <div className="h-10 bg-gray-200 rounded-lg w-80 max-w-full mb-3 animate-pulse mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-96 max-w-full animate-pulse mx-auto"></div>
          </div>
          
          {/* Loading Sections */}
          <div className="space-y-12">
            {[1, 2, 3].map((section) => (
              <div key={section}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-7 bg-gray-200 rounded w-52 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((item) => (
                    <ProductSkeleton key={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gray-50 pt-20`}>
      <NotificationProvider />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm mb-6">
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">Live Shopping Experience</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Discover Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Perfect </span>
              Products
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Smart recommendations powered by AI to match your unique style and preferences
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-gray-700">
                  {recommendedProducts.length + popularProducts.length + newProducts.length}+ Products
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" strokeWidth={2.5} />
                <span className="text-sm font-medium text-gray-700">Personalized Picks</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" strokeWidth={2.5} />
                <span className="text-sm font-medium text-gray-700">Trending Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          <ProductSection
            title="Recommended for You"
            icon={Star}
            products={recommendedProducts}
            type="recommended"
          />
          <ProductSection
            title="Popular Products"
            icon={TrendingUp}
            products={popularProducts}
            type="popular"
          />
          <ProductSection
            title="New Arrivals"
            icon={Sparkles}
            products={newProducts}
            type="new"
          />
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="mt-20 mb-16 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 shadow-xl">
          <div className="absolute top-0 right-0 opacity-20">
            <LayoutGrid className="h-64 w-64 text-white" strokeWidth={1} />
          </div>
          
          <div className="relative text-center">
            <Grid3x3 className="h-12 w-12 text-white mx-auto mb-4" strokeWidth={2} />
            <h2 className="text-4xl font-bold text-white mb-3">
              Explore Our Full Collection
            </h2>
            <p className="text-blue-100 mb-6 text-lg max-w-xl mx-auto">
              Browse through thousands of products across all categories
            </p>
            <Link
              href="/customer/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all group"
            >
              <Package className="h-5 w-5" strokeWidth={2.5} />
              View All Products
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}