/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '../header';
import Footer from '@/components/ui/Footer';

export default function AboutPage() {
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
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
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
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent);
        }
      `}</style>

      {/* Header */}
      <Header/>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-indigo-50 opacity-70"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Our Story</h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Founded in 2025, we started with a simple idea: make online shopping effortless, enjoyable, and accessible to everyone.
                Today, we&apos;re proud to serve customers worldwide with carefully curated products and exceptional service.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section ref={addToRefs} className="py-20 bg-white opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  To provide a seamless shopping experience with carefully curated products that bring joy and value to our customers' lives.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We believe that everyone deserves access to quality products at fair prices, delivered with exceptional service.
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Quality Guaranteed</h3>
                      <p className="text-sm text-gray-500">Every product vetted</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">Secure Shopping</h3>
                      <p className="text-sm text-gray-500">Your data is protected</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-5xl text-indigo-600 mb-4">🛍️</div>
                    <p className="text-gray-600 italic">Image representing our brand values</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-6 w-3/5 border border-gray-100">
                  <h4 className="font-semibold text-gray-900">1M+ Happy Customers</h4>
                  <p className="text-sm text-gray-600 mt-1">and counting since 2025</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section ref={addToRefs} className="py-20 bg-gray-50 opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Our Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md border border-gray-100 group"
                >
                  <div className="text-indigo-600 mb-6 bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section ref={addToRefs} className="py-20 bg-white opacity-0 gradient-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Milestones that shaped our story</p>
            </div>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-indigo-200 to-indigo-100"></div>
              
              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className={`relative flex items-center justify-between ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-indigo-600">{milestone.year}</h3>
                        <h4 className="text-lg font-semibold text-gray-900 mt-2">{milestone.event}</h4>
                        <p className="text-gray-600 mt-2 text-sm">{milestone.description}</p>
                      </div>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-md z-10"></div>
                    
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section ref={addToRefs} className="py-20 bg-gray-50 opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">The passionate people behind our success</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md border border-gray-100 group"
                >
                  <div className="p-6 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1">
                        <div className="bg-white rounded-full p-1">
                          <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-indigo-600 text-sm font-medium">{member.role}</p>
                    <div className="w-12 h-0.5 bg-gray-100 my-4"></div>
                    <p className="text-gray-600 text-center text-sm leading-relaxed">{member.bio}</p>
                    
                    <div className="flex space-x-3 mt-6">
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full bg-gray-50 hover:bg-indigo-50">
                        <span className="sr-only">Twitter</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full bg-gray-50 hover:bg-indigo-50">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={addToRefs} className="py-20 bg-white opacity-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Join Our Community</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Become part of our growing family of satisfied customers and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/products"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium flex items-center justify-center"
              >
                <span>Start Shopping</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center"
              >
                <span>Contact Us</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}