/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import Header from './header';
import { useState, useEffect } from 'react';

import { Funnel_Sans, Fascinate } from "next/font/google"; 
import Footer from '@/components/ui/Footer';

const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });
const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})

export default function Page() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(featureInterval);
  }, []);

  const features = [
    {
      title: "Free Shipping",
      description: "On all orders over $50",
      icon: "🚚"
    },
    {
      title: "Secure Payment",
      description: "100% secure payment processing",
      icon: "🔒"
    },
    {
      title: "Easy Returns",
      description: "30-day money-back guarantee",
      icon: "↩️"
    }
  ];

  const categories = [
    { id: 15, name: "Music & Instruments", description: "Musical instruments, sheet music, audio gear", icon: "🎵", items: 124 },
    { id: 13, name: "Footwears", description: "Casual Shoes, Formal Shoes, Sandals, Sneakers, Boots", icon: "👟", items: 89 },
    { id: 12, name: "Jewelry & Watches", description: "Gold, Silver, Artificial Jewelry, Smartwatches", icon: "💎", items: 76 },
    { id: 11, name: "Automobile & Accessories", description: "Car/Bike Parts, Tools, Oils, Helmets", icon: "🚗", items: 54 },
    { id: 10, name: "Toys & Baby Products", description: "Toys, Games, Diapers, Baby Food, Kids' Essentials", icon: "🧸", items: 67 },
    { id: 9, name: "Books & Stationery", description: "Novels, Academic Books, Office Supplies, Art Materials", icon: "📚", items: 142 },
    { id: 8, name: "Sports & Fitness", description: "Gym Equipment, Sportswear, Outdoor Gear", icon: "⚽", items: 98 },
    { id: 7, name: "Home & Kitchen", description: "Furniture, Cookware, Storage, Appliances, Home Décor", icon: "🏠", items: 205 },
    { id: 6, name: "Health & Beauty", description: "Skincare, Makeup, Haircare, Personal Care", icon: "💄", items: 167 },
    { id: 5, name: "Fashion & Apparel", description: "Men's, Women's, and Kids' Clothing, Accessories", icon: "👗", items: 312 }
  ];

  const testimonials = [
    {
      name: "Sarah J.",
      comment: "The shopping experience was flawless! Fast delivery and excellent products.",
      rating: 5
    },
    {
      name: "Michael T.",
      comment: "Great prices and even better customer service. Will shop again!",
      rating: 4
    },
    {
      name: "Emily R.",
      comment: "Love the quality of products. The website is so easy to navigate.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Header />

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-14 ">
              Discover Endless Possibilities
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto ">
              Shop the latest trends with confidence. We offer premium products, secure checkout, and fast delivery.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/products"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <span className="mr-2">Browse Products</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="/auth/register"
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
              >
                <span className="mr-2">Create Account</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-md transition-all duration-500 transform hover:-translate-y-2 border-t-4 ${index === 0 ? 'border-blue-500' : index === 1 ? 'border-purple-500' : 'border-indigo-500'}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Categories Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  href={`/products?category=${category.id}`}
                  key={category.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 group"
                >
                  <div className="p-6 flex flex-col items-center justify-center h-48">
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-800 text-center">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.items} items</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Products Banner */}
          <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
            <div className="md:flex items-center justify-between p-8 md:p-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-white mb-4">Summer Collection 2023</h2>
                <p className="text-indigo-100 mb-6">Discover our new arrivals and get 20% off your first order with code SUMMER23</p>
                <Link
                  href="/sale"
                  className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300"
                >
                  Shop Now
                </Link>
              </div>
              <div className="md:w-2/5 flex justify-center">
                <div className="relative w-64 h-64 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <div className="w-52 h-52 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <div className="w-40 h-40 bg-white bg-opacity-40 rounded-full flex items-center justify-center text-5xl">
                      👕
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.comment}"</p>
                  <p className="text-gray-800 font-medium">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-20 bg-gray-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Subscribe to our newsletter for exclusive deals, new arrivals, and style tips.</p>
            <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-l-lg sm:rounded-r-none sm:rounded-l-lg flex-grow border-0 focus:ring-2 focus:ring-indigo-500"
              />
              <button className="mt-2 sm:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-r-lg hover:bg-indigo-700 transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

    <Footer/>
    </div>
  );
}