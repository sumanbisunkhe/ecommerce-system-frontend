/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { Wallet, Loader2, ListFilter, CheckCircle, Clock, XCircle, Receipt } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Image from 'next/image';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl: string | null;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

const filterOptions = [
  'ALL',
  'TODAY',
  'LAST WEEK',
  'LAST 15 DAYS',
  'LAST MONTH',
  'LAST YEAR'
];

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    size: 10,
    number: 0,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
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
          `${BASE_URL}/payment/user/${userId}?filter=${currentFilter}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch payments');

        const data = await response.json();
        if (data.success) {
          setPayments(data.data.content);
          setPageInfo(data.data.page);
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        notify.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [currentFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date),
      time: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date)
    };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      COMPLETED: {
        icon: CheckCircle,
        colors: 'bg-green-100 text-green-800 ring-green-600/20',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        cardBorder: 'border-l-4 border-l-green-500',
        timeColor: 'text-green-700'
      },
      PENDING: {
        icon: Clock,
        colors: 'bg-amber-100 text-amber-800 ring-amber-600/20',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        cardBorder: 'border-l-4 border-l-amber-500',
        timeColor: 'text-amber-700'
      },
      FAILED: {
        icon: XCircle,
        colors: 'bg-red-100 text-red-800 ring-red-600/20',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        cardBorder: 'border-l-4 border-l-red-500',
        timeColor: 'text-red-700'
      }
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      COMPLETED: (
        <div className="p-1.5 bg-green-100 rounded-full">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        </div>
      ),
      PENDING: (
        <div className="p-1.5 bg-amber-100 rounded-full">
          <Clock className="h-3.5 w-3.5 text-amber-600" />
        </div>
      ),
      FAILED: (
        <div className="p-1.5 bg-red-100 rounded-full">
          <XCircle className="h-3.5 w-3.5 text-red-600" />
        </div>
      ),
    };
    return icons[status as keyof typeof icons] || null;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      KHALTI: 'https://res.cloudinary.com/dxql0x0iq/image/upload/v1757784401/khalti_yv4jqo.png',
      CASH_ON_DELIVERY: 'https://res.cloudinary.com/dxql0x0iq/image/upload/v1757784762/money_a5sbxj.jpg',
  
    };
    return icons[method as keyof typeof icons] || null;
  };

  const groupPaymentsByDate = (payments: Payment[]) => {
    return payments.reduce((groups, payment) => {
      const date = new Date(payment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(payment);
      return groups;
    }, {} as Record<string, Payment[]>);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-16 px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 font-medium">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-16 sm:pt-20 lg:pt-24`}>
      <NotificationProvider />
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Clean Premium Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative px-4 sm:px-6 lg:px-10 py-4 sm:py-6 bg-white">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] bg-[size:20px_20px]"></div>
            
            <div className="relative">
              {/* Single Row Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
                {/* Left - Title with Icon */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2.5 sm:p-3 bg-blue-50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-blue-100 flex-shrink-0">
                    <Wallet className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight truncate">
                      Payment History
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                      Track all your transactions
                    </p>
                  </div>
                </div>

                {/* Center - Stats */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Total Transactions */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 sm:p-2 bg-blue-50 backdrop-blur-sm rounded-lg border border-blue-100 flex-shrink-0">
                      <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Transactions</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {pageInfo.totalElements}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block h-10 w-px bg-gray-200"></div>

                  {/* Current Filter Display */}
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-600 font-medium">Period</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 capitalize whitespace-nowrap">
                      {currentFilter === 'ALL' ? 'All Time' : currentFilter.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                {/* Right - Filter */}
                <div className="w-full lg:w-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 sm:left-3.5 flex items-center pointer-events-none">
                      <ListFilter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                    </div>
                    <select
                      value={currentFilter}
                      onChange={(e) => setCurrentFilter(e.target.value)}
                      className="w-full lg:w-auto pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl 
                               text-xs sm:text-sm font-semibold bg-white shadow-md
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               appearance-none cursor-pointer hover:shadow-lg transition-all duration-200
                               text-gray-700 lg:min-w-[180px]"
                    >
                      {filterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0) + option.slice(1).toLowerCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 sm:right-3.5 flex items-center pointer-events-none">
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Cards */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {payments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-8 sm:p-12 lg:p-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 
                flex items-center justify-center shadow-inner">
                <Wallet className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No payments found</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                There are no payment records for the selected time period.
                Try adjusting your filter settings to view more transactions.
              </p>
            </div>
          ) : (
            Object.entries(groupPaymentsByDate(payments)).map(([date, datePayments]) => (
              <div key={date} className="space-y-3 sm:space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 
                    bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 whitespace-nowrap">
                    {date}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                </div>

                {/* Payment Cards */}
                <div className="space-y-2.5 sm:space-y-3">
                  {datePayments.map((payment) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const { time } = formatDate(payment.createdAt);
                    
                    return (
                      <div 
                        key={payment.id}
                        className="group bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl 
                          transition-all duration-300 border border-white/20 overflow-hidden
                          sm:hover:scale-[1.01] sm:hover:-translate-y-1"
                      >
                        <div className={`h-0.5 sm:h-1 bg-gradient-to-r ${
                          payment.status === 'COMPLETED' ? 'from-green-400 to-emerald-500' :
                          payment.status === 'PENDING' ? 'from-amber-400 to-orange-500' :
                          'from-red-400 to-rose-500'
                        }`}></div>
                        
                        <div className="p-4 sm:p-5 lg:p-6">
                          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-5 lg:gap-6">
                            {/* Left Section */}
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                              {/* Status Icon */}
                              <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl ${statusConfig.iconBg} shadow-sm ring-2 ring-white/50
                                group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                {getStatusIcon(payment.status)}
                              </div>
                              
                              {/* Payment Details */}
                              <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0">
                                {/* Top Row */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                  <span className="text-base sm:text-lg font-bold text-gray-900">
                                    Payment #{payment.id}
                                  </span>
                                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg 
                                    text-[10px] sm:text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${statusConfig.colors}
                                    shadow-sm`}>
                                    {payment.status}
                                  </span>
                                  <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-gray-100 
                                    font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">
                                    {time}
                                  </span>
                                </div>

                                {/* Payment Method */}
                                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-gray-50 to-transparent 
                                  rounded-lg sm:rounded-xl border border-gray-100/50">
                                  {getPaymentMethodIcon(payment.method) && (
                                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-md sm:rounded-lg overflow-hidden 
                                      border-2 border-white bg-white shadow-sm flex-shrink-0">
                                      <Image
                                        src={getPaymentMethodIcon(payment.method)!}
                                        alt={payment.method}
                                        fill
                                        className="object-contain p-1 sm:p-1.5"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                      {payment.method.replace('_', ' ')}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-mono truncate">
                                      {payment.transactionId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Section - Amount */}
                            <div className="w-full lg:w-auto text-left lg:text-right flex-shrink-0">
                              <div className="inline-flex flex-col items-start lg:items-end p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 
                                rounded-lg sm:rounded-xl border border-blue-100/50 shadow-sm w-full lg:w-auto">
                                <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                                  Amount
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                                  bg-clip-text text-transparent">
                                  रु {payment.amount.toLocaleString('en-IN')}
                                </p>
                              </div>
                              {payment.status === 'COMPLETED' && (
                                <p className="text-[10px] sm:text-xs text-green-600 font-medium mt-2">
                                  ✓ Completed at {formatDate(payment.updatedAt).time}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
