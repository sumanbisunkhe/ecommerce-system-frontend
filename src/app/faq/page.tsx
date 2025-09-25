/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Header from '../header';
import Footer from '@/components/ui/Footer';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});
  const searchRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
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

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      id: 'ordering',
      title: 'Ordering & Payments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
  const addToRefs = (el) => {
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
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .faq-answer.open {
          max-height: 500px;
        }
      `}</style>

      {/* Header */}
      <Header/>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-indigo-50 opacity-70"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Find answers to common questions about our products, services, and policies.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section ref={addToRefs} className="py-12 bg-white opacity-0 gradient-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search for answers..."
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              Can't find what you're looking for? <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">Contact us</Link>
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section ref={addToRefs} className="py-16 bg-gray-50 opacity-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Browse by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select a category to find answers to specific questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faqCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`#${category.id}`}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100 group"
                >
                  <div className="text-indigo-600 mb-4 bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{category.title}</h3>
                  <p className="text-gray-500 text-sm">{category.questions.length} questions</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section ref={addToRefs} className="py-16 bg-white opacity-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={category.id} id={category.id} className="mb-16">
                <div className="flex items-center mb-8">
                  <div className="text-indigo-600 bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((item, index) => {
                    const itemIndex = `${categoryIndex}-${index}`;
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          className="flex justify-between items-center w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                          onClick={() => toggleItem(itemIndex)}
                        >
                          <span className="font-medium text-gray-900">{item.question}</span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${openItems[itemIndex] ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                        <div className={`faq-answer ${openItems[itemIndex] ? 'open' : ''}`}>
                          <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section ref={addToRefs} className="py-16 bg-gray-50 opacity-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Still have questions?</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Our customer support team is here to help you with any additional questions you may have.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  href="/contact"
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
                >
                  <span>Contact Support</span>
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </Link>
                <a
                  href="tel:+15551234567"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
                >
                  <span>Call Us</span>
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </a>
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