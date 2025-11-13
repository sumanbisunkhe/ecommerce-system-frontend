/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import Link from 'next/link';
import { Loader2, Grid, Smartphone, ShoppingBasket, Shirt, Sparkles, Home, Dumbbell, BookOpen, Baby, Car, Watch, Footprints, Music, ArrowRight } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const getCategoryIcon = (name: string) => {
  const icons = {
    'Electronics': Smartphone,
    'Grocery': ShoppingBasket,
    'Fashion & Apparel': Shirt,
    'Health & Beauty': Sparkles,
    'Home & Kitchen': Home,
    'Sports & Fitness': Dumbbell,
    'Books & Stationery': BookOpen,
    'Toys & Baby Products': Baby,
    'Automobile & Accessories': Car,
    'Jewelry & Watches': Watch,
    'Footwears': Footprints,
    'Music & Instruments': Music,
  };
  const IconComponent = icons[name as keyof typeof icons] || Grid;
  return IconComponent;
};

const getCategoryStyle = (name: string) => {
  const styles = {
    'Electronics': 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    'Grocery': 'from-green-500 to-emerald-600 shadow-green-500/20',
    'Fashion & Apparel': 'from-purple-500 to-pink-600 shadow-purple-500/20',
    'Health & Beauty': 'from-pink-500 to-rose-600 shadow-pink-500/20',
    'Home & Kitchen': 'from-yellow-500 to-amber-600 shadow-yellow-500/20',
    'Sports & Fitness': 'from-red-500 to-orange-600 shadow-red-500/20',
    'Books & Stationery': 'from-teal-500 to-cyan-600 shadow-teal-500/20',
    'Toys & Baby Products': 'from-violet-500 to-purple-600 shadow-violet-500/20',
    'Automobile & Accessories': 'from-slate-500 to-gray-600 shadow-slate-500/20',
    'Jewelry & Watches': 'from-amber-500 to-yellow-600 shadow-amber-500/20',
    'Footwears': 'from-orange-500 to-red-600 shadow-orange-500/20',
    'Music & Instruments': 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
  };
  return styles[name as keyof typeof styles] || 'from-blue-500 to-indigo-600 shadow-blue-500/20';
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) throw new Error('Authentication token not found');

        const response = await fetch(`${BASE_URL}/categories/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error('Please login to continue');
        }

        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (error: any) {
        notify.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: number) => {
    e.preventDefault();
    router.push(`/customer/products?category=${categoryId}`);
  };

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100`}>
      <NotificationProvider />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen pt-20 sm:pt-24 md:pt-28">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-2 text-sm text-slate-600">Loading categories...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 pt-20 sm:pt-24 md:pt-28">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold tracking-wide">
                EXPLORE CATEGORIES
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Discover Your
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Collection
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Browse through our <span className="font-bold text-indigo-600">{categories.length}</span> carefully curated categories
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((category, index) => {
              const IconComponent = getCategoryIcon(category.name);
              const categoryStyle = getCategoryStyle(category.name);
              const gradientClass = categoryStyle.split(' ')[0] + ' ' + categoryStyle.split(' ')[1];
              const shadowClass = categoryStyle.split(' ')[2];

              return (
                <Link
                  key={category.id}
                  href="#"
                  onClick={(e) => handleCategoryClick(e, category.id)}
                  className="group block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`relative h-full bg-white rounded-3xl overflow-hidden transition-all duration-500 ease-out
                    hover:shadow-2xl hover:shadow-${shadowClass} hover:-translate-y-2 
                    border border-slate-200/50 hover:border-transparent`}>
                    
                    {/* Gradient Background with Icon */}
                    <div className={`relative bg-gradient-to-br ${gradientClass} p-8 sm:p-10 overflow-hidden`}>
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
                      </div>
                      
                      {/* Icon */}
                      <div className="relative">
                        <div className="inline-flex p-4 bg-white/20 backdrop-blur-xl rounded-2xl 
                          shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-white drop-shadow-lg" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 line-clamp-2 mb-6">
                        {category.description}
                      </p>
                      
                      {/* Call to action */}
                      <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                        <span>Explore Now</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Hover overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-16 sm:mt-20 md:mt-24 text-center">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  Can&apos;t Find What You&apos;re Looking For?
                </h2>
                <p className="text-indigo-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                  Browse all products or use our search to discover exactly what you need
                </p>
                <Link
                  href="/customer/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold
                    hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  View All Products
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
