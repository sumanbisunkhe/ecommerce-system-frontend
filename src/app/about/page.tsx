/* eslint-disable react/no-unescaped-entities */
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '../header';
import Footer from '@/components/ui/Footer';

function AboutContent() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Copy ref value to a variable inside the effect
    const currentRefs = sectionRefs.current;

    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Suman Bisunkhe",
      role: "CEO & Founder",
      image: "https://res.cloudinary.com/dxql0x0iq/image/upload/v1757714806/ecommerce/4cd45fd0-445e-405a-b76a-c33bd5fbfc8b.jpg",
      bio: "10+ years of experience in e-commerce and retail management. Passionate about creating exceptional customer experiences."
    },
    {
      id: 2,
      name: "Hayley Lawrence",
      role: "Head of Technology",
      image: "https://res.cloudinary.com/dxql0x0iq/image/upload/v1758531553/haley-lawrence-xrF0-5Ve5nU-unsplash_idxlbe.jpg",
      bio: "Tech enthusiast with expertise in building scalable e-commerce platforms and seamless user experiences."
    },
    {
      id: 3,
      name: "Albert Dera",
      role: "Product Curator",
      image: "https://res.cloudinary.com/dxql0x0iq/image/upload/v1758531553/albert-dera-ILip77SbmOE-unsplash_lpiqbw.jpg",
      bio: "Former fashion buyer with an eye for quality products that customers will love."
    },
    {
      id: 4,
      name: "Rachel Mcdermott",
      role: "Customer Success",
      image: "https://res.cloudinary.com/dxql0x0iq/image/upload/v1758531552/rachel-mcdermott-0fN7Fxv1eWA-unsplash_caxbfk.jpg",
      bio: "Dedicated to ensuring every customer has a positive shopping experience from start to finish."
    }
  ];

  const values = [
    {
      title: "Quality First",
      description: "We meticulously curate every product to ensure it meets our high standards of quality and value.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
        </svg>
      )
    },
    {
      title: "Customer Centric",
      description: "Our customers are at the heart of everything we do. Their satisfaction is our top priority.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    },
    {
      title: "Innovation Driven",
      description: "We continuously evolve our platform and services to provide the best shopping experience.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      title: "Community Focused",
      description: "We believe in giving back and supporting the communities that support us.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    }
  ];

  const milestones = [
    { year: "2025", event: "Company Founded", description: "Started with a vision to revolutionize online shopping" },
    { year: "2026", event: "First 10,000 Customers", description: "Reached our first major milestone in customer growth" },
    { year: "2027", event: "Mobile App Launch", description: "Launched our award-winning shopping app" },
    { year: "2028", event: "Global Expansion", description: "Began shipping to over 50 countries worldwide" },
    { year: "2029", event: "1 Million Customers", description: "Celebrated serving our one millionth customer" },
    { year: "2030", event: "Sustainability Initiative", description: "Committed to carbon-neutral shipping and packaging" }
  ];

  // Add ref to each section for animation
  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .opacity-0 {
          opacity: 0;
        }
        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .premium-shadow {
          box-shadow: 0 20px 60px -15px rgba(99, 102, 241, 0.15);
        }
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <Header/>

      <main className="pt-16 sm:pt-20">
        {/* Hero Section - Premium Design */}
        <section className="relative py-16 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 sm:w-40 sm:h-40 lg:w-52 lg:h-52 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Subtitle badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-6 sm:mb-8">
                <span className="text-xs sm:text-sm font-semibold text-indigo-600">✨ Established 2025</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                <span className="block">Our Story</span>
                <span className="block text-gradient mt-2">Building the Future</span>
              </h1>
              
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Founded in 2025, we started with a simple idea: make online shopping effortless, enjoyable, and accessible to everyone.
                Today, we&apos;re proud to serve customers worldwide with carefully curated products and exceptional service.
              </p>
              
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                <div className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg bg-white shadow-md border border-gray-100">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">1M+</span>
                  <span className="text-xs sm:text-sm text-gray-600">Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg bg-white shadow-md border border-gray-100">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">50+</span>
                  <span className="text-xs sm:text-sm text-gray-600">Countries Served</span>
                </div>
                <div className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg bg-white shadow-md border border-gray-100">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">99%</span>
                  <span className="text-xs sm:text-sm text-gray-600">Satisfaction Rate</span>
                </div>
              </div>
              
              <div className="mt-10 sm:mt-12 flex justify-center">
                <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section - Enhanced Responsive Design */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                  Our Mission
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight leading-tight">
                  Creating Extraordinary Shopping Experiences
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  To provide a seamless shopping experience with carefully curated products that bring joy and value to our customers' lives.
                </p>
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  We believe that everyone deserves access to quality products at fair prices, delivered with exceptional service.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                    <div className="bg-white rounded-full p-2 sm:p-3 shadow-sm">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Quality Guaranteed</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Every product vetted</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-lg transition-all duration-300">
                    <div className="bg-white rounded-full p-2 sm:p-3 shadow-sm">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Secure Shopping</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Your data protected</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative order-1 lg:order-2">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden premium-shadow">
                  <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 aspect-[4/3] sm:aspect-video flex items-center justify-center p-6 sm:p-8">
                    <div className="text-center">
                      <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 animate-float">🛍️</div>
                      <p className="text-sm sm:text-base text-gray-700 italic font-medium">Building Trust Through Quality</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating stat card */}
                <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 right-4 sm:right-auto glass-effect rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-auto sm:w-3/5 border border-white/50">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 sm:p-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">1M+ Happy Customers</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Growing since 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Premium Card Design */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
                Core Values
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">What Drives Us Forward</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white p-6 sm:p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-indigo-200 premium-shadow hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-indigo-600 mb-5 sm:mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                      {value.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-indigo-600 transition-colors">{value.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-indigo-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section - Mobile Optimized */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white opacity-0 gradient-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-xs sm:text-sm font-semibold mb-4">
                Our Journey
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Milestones That Shaped Us</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Every step of our incredible journey</p>
            </div>
            
            <div className="relative">
              {/* Vertical line - Hidden on mobile, visible on md+ */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>
              
              {/* Mobile vertical line */}
              <div className="md:hidden absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>
              
              {/* Timeline items */}
              <div className="space-y-8 sm:space-y-10 md:space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                  >
                    {/* Mobile/Tablet Layout */}
                    <div className="md:hidden flex items-start space-x-4 sm:space-x-6 pl-8 sm:pl-12">
                      <div className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full border-4 border-white shadow-md -ml-[1.625rem] sm:-ml-[1.875rem] mt-2"></div>
                      <div className="flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl glass-effect premium-shadow border border-white/50">
                        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-bold mb-2 sm:mb-3">
                          {milestone.year}
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{milestone.event}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className={`hidden md:flex items-center justify-between w-full ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 lg:pr-12 text-right' : 'pl-8 lg:pl-12 text-left'}`}>
                        <div className="p-6 lg:p-8 rounded-2xl glass-effect premium-shadow border border-white/50 group hover:scale-105 transition-all duration-500">
                          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm lg:text-base font-bold mb-3 ${index % 2 === 0 ? '' : ''}`}>
                            {milestone.year}
                          </div>
                          <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{milestone.event}</h4>
                          <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{milestone.description}</p>
                        </div>
                      </div>
                      
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full border-4 border-white shadow-lg z-10 hover:scale-125 transition-transform duration-300"></div>
                      
                      <div className="w-5/12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section - Enhanced Cards */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-xs sm:text-sm font-semibold mb-4">
                Our Team
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Meet The Dream Team</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">The passionate people behind our success</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden premium-shadow hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden aspect-square sm:aspect-[3/4]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Social icons on hover */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <button className="bg-white/90 backdrop-blur-sm text-gray-700 hover:text-indigo-600 transition-colors p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transform transition-transform">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </button>
                      <button className="bg-white/90 backdrop-blur-sm text-gray-700 hover:text-indigo-600 transition-colors p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transform transition-transform">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                    <p className="text-indigo-600 text-xs sm:text-sm font-semibold mt-1 mb-3 sm:mb-4">{member.role}</p>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 sm:mb-4"></div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Premium Gradient */}
        <section ref={addToRefs} className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/30">
              Join Us Today
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              Ready to Experience the Difference?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Become part of our growing family of satisfied customers and experience premium shopping like never before.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link
                href="/products"
                className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-sm sm:text-base flex items-center justify-center group hover:scale-105 transform"
              >
                <span>Start Shopping</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 font-semibold text-sm sm:text-base flex items-center justify-center group hover:scale-105 transform backdrop-blur-sm"
              >
                <span>Contact Us</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-10 sm:mt-12 md:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-white/80 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <AboutContent />
    </Suspense>
  );
}