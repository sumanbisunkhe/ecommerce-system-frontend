/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { TrendingUp, Sparkles, Star, Loader2 } from 'lucide-react';
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

const ProductSection = ({ title, icon: Icon, products, type }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100/50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
    </div>
    
    <div className="p-6">
      {products.length === 0 ? (
        <div className="text-center text-gray-500">No products available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/customer/products/${product.id}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                  <Image
                    src={product.imageUrl || '/product-placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-blue-600">
                      रु {product.price.toLocaleString('en-IN')}
                    </span>
                    {type === 'recommended' && (
                      <p className="mt-1 text-xs text-gray-500">
                        {product.recommendationType === 'COLLABORATIVE' 
                          ? 'Based on similar users' 
                          : 'Similar to your interests'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
);

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
      } catch (error: any) {
        notify.error('Failed to fetch trending products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gray-50 pt-20`}>
      <NotificationProvider />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
    </div>
  );
}
