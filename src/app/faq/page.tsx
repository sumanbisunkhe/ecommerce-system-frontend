/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, Suspense } from 'react';
import Header from '../header';
import Footer from '@/components/ui/Footer';

function FAQContent() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement>>([]);

  useEffect(() => {
    setIsVisible(true);
    
    const currentSectionRefs = sectionRefs.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    currentSectionRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentSectionRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);


  type OpenItemsState = Record<string, boolean>;

  const toggleItem = (index: string) => {
    setOpenItems((prev: OpenItemsState) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      id: 'ordering',
      title: 'Ordering & Payments',
      gradient: 'from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      ),
      questions: [
        {
          question: "How do I place an order?",
          answer: "To place an order, simply browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping information and payment details to complete your purchase."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely through encrypted channels."
        },
        {
          question: "Can I modify or cancel my order after placing it?",
          answer: "You can modify or cancel your order within 1 hour of placement. After that, your order enters our processing system and cannot be changed. Please contact our customer service immediately if you need to make changes."
        },
        {
          question: "Do you offer installment payment options?",
          answer: "Yes, we offer installment payment options through select providers. At checkout, you'll see available payment plans if you qualify. These allow you to spread the cost of your purchase over several months."
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      gradient: 'from-indigo-500 to-purple-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
      questions: [
        {
          question: "What are your shipping options?",
          answer: "We offer standard shipping (3-5 business days), expedited shipping (2-3 business days), and express shipping (1-2 business days). Shipping costs vary based on the option selected and your location."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to over 50 countries worldwide. International shipping times typically range from 7-14 business days, depending on the destination. Additional customs fees may apply for international orders."
        },
        {
          question: "How can I track my order?",
          answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can use this tracking number on our website or the carrier's website to monitor your package's journey."
        },
        {
          question: "What should I do if my package is lost or damaged?",
          answer: "If your package is lost in transit or arrives damaged, please contact our customer service team within 7 days of delivery. We'll work with the shipping carrier to resolve the issue and ensure you receive a replacement or refund."
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      gradient: 'from-purple-500 to-pink-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      ),
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for all unused items in their original packaging with tags attached. Items must be in resellable condition. Some products like personal care items and undergarments may not be eligible for return due to hygiene reasons."
        },
        {
          question: "How do I initiate a return?",
          answer: "To initiate a return, log into your account, go to your order history, and select the item(s) you wish to return. Follow the prompts to generate a return label. Alternatively, you can contact our customer service team for assistance."
        },
        {
          question: "How long does it take to process a refund?",
          answer: "Once we receive your returned item, refunds are processed within 3-5 business days. The time it takes for the refund to appear in your account depends on your payment method and financial institution, typically 5-10 business days."
        },
        {
          question: "Do you offer exchanges?",
          answer: "Yes, we offer exchanges for size or color variations, subject to availability. You can request an exchange through your account dashboard or by contacting customer service. If the desired item is not available, we'll process a refund instead."
        }
      ]
    },
    {
      id: 'products',
      title: 'Product Information',
      gradient: 'from-pink-500 to-rose-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
      questions: [
        {
          question: "How do I know what size to order?",
          answer: "We provide detailed size charts for each product category on our product pages. We recommend measuring yourself and comparing your measurements to our charts for the best fit. If you're between sizes, we suggest sizing up."
        },
        {
          question: "Are your products ethically sourced?",
          answer: "Yes, we're committed to ethical sourcing practices. We partner with suppliers who adhere to fair labor practices and maintain transparency in their supply chains. Many of our products are certified by recognized ethical trade organizations."
        },
        {
          question: "Do you offer vegan or cruelty-free products?",
          answer: "We have a dedicated section for vegan and cruelty-free products. These items are clearly marked with badges on product pages. You can also filter search results to show only vegan or cruelty-free options."
        },
        {
          question: "How do I care for my products?",
          answer: "Care instructions are provided on each product's description page and on the garment tags. We recommend following these instructions to maintain the quality and longevity of your items. For specific questions, our customer service team can provide additional guidance."
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Technical',
      gradient: 'from-green-500 to-emerald-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      questions: [
        {
          question: "How do I create an account?",
          answer: "You can create an account by clicking the 'Sign Up' button in the top navigation. You'll need to provide your email address and create a password. Alternatively, you can create an account during checkout."
        },
        {
          question: "I forgot my password. How can I reset it?",
          answer: "Click on the 'Sign In' button and then select 'Forgot Password.' Enter your email address, and we'll send you a link to reset your password. The link will expire after 24 hours for security reasons."
        },
        {
          question: "How do I update my account information?",
          answer: "Log into your account and navigate to the 'Account Settings' section. Here you can update your personal information, shipping addresses, payment methods, and communication preferences."
        },
        {
          question: "How do I unsubscribe from marketing emails?",
          answer: "You can unsubscribe from marketing emails by clicking the 'Unsubscribe' link at the bottom of any marketing email we send. Alternatively, you can adjust your email preferences in the 'Communication Settings' section of your account."
        }
      ]
    },
    {
      id: 'company',
      title: 'Company Information',
      gradient: 'from-orange-500 to-amber-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      ),
      questions: [
        {
          question: "Where are you located?",
          answer: "Our headquarters is located at 123 Commerce Street, City, State 12345. We have distribution centers across the United States and partner facilities in Europe and Asia to serve our international customers efficiently."
        },
        {
          question: "What are your sustainability practices?",
          answer: "We're committed to sustainability through various initiatives including carbon-neutral shipping, eco-friendly packaging, responsible sourcing, and partnerships with environmental organizations. We continuously work to reduce our environmental impact across all operations."
        },
        {
          question: "Do you have physical stores?",
          answer: "Currently, we operate exclusively online. This allows us to keep costs lower and pass the savings to our customers. We occasionally host pop-up shops in major cities - follow us on social media to stay updated on these events."
        },
        {
          question: "How can I contact customer service?",
          answer: "You can reach our customer service team via email at support@yourcompany.com, by phone at +1 (555) 123-4567 during business hours (9am-6pm EST, Mon-Fri), or through the live chat feature on our website. We typically respond within 24 hours."
        }
      ]
    }
  ];

  // Add ref to each section for animation
  type AddToRefs = (el: HTMLElement | null) => void;

  const addToRefs: AddToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          opacity: 0;
        }
        .faq-answer.open {
          max-height: 800px;
          opacity: 1;
        }
      `}</style>

      {/* Header */}
      <Header/>

      <main className="pt-16 sm:pt-20">
        {/* Hero Section - Premium Design */}
        <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
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
                <span className="text-xs sm:text-sm font-semibold text-indigo-600">❓ Help Center</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                <span className="block">Frequently Asked</span>
                <span className="block text-gradient mt-2">Questions</span>
              </h1>
              
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Find answers to common questions about our products, services, and policies.
                Everything you need to know in one place.
              </p>
              
              <div className="mt-10 sm:mt-12 flex justify-center">
                <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section - Premium Design */}
        <section ref={addToRefs} className="py-12 sm:py-16 bg-white opacity-0 gradient-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="relative glass-effect rounded-2xl sm:rounded-3xl premium-shadow p-2">
                <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="block w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-5 bg-transparent border-0 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Search suggestions */}
              <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-500">Popular:</span>
                {['Shipping', 'Returns', 'Payment', 'Account'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 text-gray-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
              Can't find what you're looking for?{' '}
              <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                Contact our support team
              </Link>
            </p>
          </div>
        </section>

        {/* FAQ Categories - Enhanced Cards */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white opacity-0 gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="inline-block px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                Quick Navigation
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                Browse by Category
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Select a category to jump to specific questions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {faqCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`#${category.id}`}
                  className="group relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 premium-shadow hover:shadow-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`text-white mb-5 sm:mb-6 bg-gradient-to-br ${category.gradient} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      {category.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-indigo-600 transition-colors">
                      {category.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm sm:text-base text-gray-500">
                        {category.questions.length} questions
                      </p>
                      <svg className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content - Premium Accordions */}
        <section ref={addToRefs} className="py-12 sm:py-16 md:py-20 bg-white opacity-0 gradient-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {(searchQuery ? filteredCategories : faqCategories).map((category, categoryIndex) => (
              <div key={category.id} id={category.id} className="mb-12 sm:mb-16 md:mb-20">
                <div className="flex items-center mb-6 sm:mb-8 md:mb-10">
                  <div className={`text-white bg-gradient-to-br ${category.gradient} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mr-4 sm:mr-5 shadow-lg`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{category.questions.length} frequently asked questions</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {category.questions.map((item, index) => {
                    const itemIndex = `${categoryIndex}-${index}`;
                    return (
                      <div 
                        key={index} 
                        className="group border-2 border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                      >
                        <button
                          className="flex justify-between items-center w-full p-5 sm:p-6 md:p-8 text-left bg-white hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                          onClick={() => toggleItem(itemIndex)}
                        >
                          <span className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 pr-4 leading-relaxed">
                            {item.question}
                          </span>
                          <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center transition-transform duration-300 ${openItems[itemIndex] ? 'rotate-180' : ''}`}>
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </button>
                        <div className={`faq-answer ${openItems[itemIndex] ? 'open' : ''}`}>
                          <div className="p-5 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50/30 border-t-2 border-gray-100">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.answer}</p>
                            
                            {/* Helpful indicator */}
                            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-500">Was this helpful?</span>
                              <div className="flex space-x-2 sm:space-x-3">
                                <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 text-xs sm:text-sm font-medium text-gray-700 hover:text-green-600">
                                  👍 Yes
                                </button>
                                <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600">
                                  👎 No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {searchQuery && filteredCategories.length === 0 && (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No results found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  We couldn't find any FAQs matching "{searchQuery}". Try different keywords or{' '}
                  <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                    contact support
                  </Link>
                  .
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section - Premium Design */}
        <section ref={addToRefs} className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/30">
              Need More Help?
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              Still Have Questions?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Our customer support team is here to help you with any additional questions you may have.
              We're available 24/7 to assist you.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-sm sm:text-base flex items-center justify-center group hover:scale-105 transform"
              >
                <span>Contact Support</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </Link>
              <a
                href="tel:+15551234567"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 font-semibold text-sm sm:text-base flex items-center justify-center group hover:scale-105 transform backdrop-blur-sm"
              >
                <span>Call Us Now</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </a>
            </div>
            
            {/* Support stats */}
            <div className="mt-10 sm:mt-12 md:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-white/80 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span>Fast Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
                <span>Expert Team</span>
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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading FAQ...</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FAQContent />
    </Suspense>
  );
}