/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import Link from 'next/link';
import { Loader2, Grid, Smartphone, ShoppingBasket, Shirt, Sparkles, Home, Dumbbell, BookOpen, Baby, Car, Watch, Footprints, Music } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';
import Header from '@/app/header';
import Footer from '@/components/ui/Footer';
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
    'Electronics': 'from-blue-50 to-indigo-50 text-blue-600 hover:text-blue-700 border-blue-100',
    'Grocery': 'from-green-50 to-emerald-50 text-green-600 hover:text-green-700 border-green-100',
    'Fashion & Apparel': 'from-purple-50 to-pink-50 text-purple-600 hover:text-purple-700 border-purple-100',
    'Health & Beauty': 'from-pink-50 to-rose-50 text-pink-600 hover:text-pink-700 border-pink-100',
    'Home & Kitchen': 'from-yellow-50 to-amber-50 text-yellow-600 hover:text-yellow-700 border-yellow-100',
    'Sports & Fitness': 'from-red-50 to-orange-50 text-red-600 hover:text-red-700 border-red-100',
    'Books & Stationery': 'from-teal-50 to-cyan-50 text-teal-600 hover:text-teal-700 border-teal-100',
    'Toys & Baby Products': 'from-violet-50 to-purple-50 text-violet-600 hover:text-violet-700 border-violet-100',
    'Automobile & Accessories': 'from-slate-50 to-gray-50 text-slate-600 hover:text-slate-700 border-slate-100',
    'Jewelry & Watches': 'from-amber-50 to-yellow-50 text-amber-600 hover:text-amber-700 border-amber-100',
    'Footwears': 'from-orange-50 to-red-50 text-orange-600 hover:text-orange-700 border-orange-100',
    'Music & Instruments': 'from-indigo-50 to-violet-50 text-indigo-600 hover:text-indigo-700 border-indigo-100',
  };
  return styles[name as keyof typeof styles] || 'from-blue-50 to-indigo-50 text-blue-600 hover:text-blue-700 border-blue-100';
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
               const response = await fetch(`${BASE_URL}/categories/all`, {
          headers: {
            // 'Authorization': `Bearer ${token}`,
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
    router.push(`/products?category=${categoryId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-gray-50 to-gray-100`}>
      <Header />
      <NotificationProvider />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-14">
        {/* Header Section */}
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Browse Categories
          </h1>
          <p className="text-lg text-gray-600">
            Explore our collection of <span className="font-semibold text-blue-600">{categories.length}</span> curated categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            const categoryStyle = getCategoryStyle(category.name);

            return (
              <Link
                key={category.id}
                href="#"
                onClick={(e) => handleCategoryClick(e, category.id)}
                className="group block"
              >
                <div className={`h-full bg-white rounded-2xl shadow-sm hover:shadow-xl border-2 ${categoryStyle.split(' ')[4]} overflow-hidden transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02]`}>
                  <div className={`bg-gradient-to-br ${categoryStyle.split(' ').slice(0, 2).join(' ')} p-8`}>
                    <div className="flex items-start gap-6">
                      <div className="p-4 rounded-xl bg-white/95 backdrop-blur-sm shadow-sm group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <IconComponent className={`h-8 w-8 ${categoryStyle.split(' ')[2]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                            {category.name}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-4 border-t border-gray-100/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center font-medium text-gray-600 group-hover:text-gray-900">
                        Browse products
                        <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />

    </div>
  );
}
