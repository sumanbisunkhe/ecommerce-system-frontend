/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { CreditCard, Loader2, ListFilter, CheckCircle, Clock, XCircle } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gray-50 pt-20`}>
      <NotificationProvider />
      <div className="max-w-8fxl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Enhanced Header */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Track and manage your payment transactions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <ListFilter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={currentFilter}
                    onChange={(e) => setCurrentFilter(e.target.value)}
                    className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0) + option.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-blue-600">
                    {pageInfo.totalElements}
                  </span>
                  <span className="text-sm text-blue-600">
                    {pageInfo.totalElements === 1 ? 'payment' : 'payments'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment List */}
          <div className="divide-y divide-gray-100">
            {payments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                  <CreditCard className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  There are no payment records for the selected time period.
                  Try adjusting your filter settings to view more transactions.
                </p>
              </div>
            ) : (
              Object.entries(groupPaymentsByDate(payments)).map(([date, datePayments]) => (
                <div key={date} className="divide-y divide-gray-100/50">
                  <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-transparent">
                    <h3 className="text-sm font-semibold text-gray-600">{date}</h3>
                  </div>
                  {datePayments.map((payment) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const { time } = formatDate(payment.createdAt);
                    
                    return (
                      <div 
                        key={payment.id}
                        className={`p-6 bg-white hover:bg-gray-50/80 transition-all duration-200 
                          ${statusConfig.cardBorder} shadow-sm hover:shadow-md rounded-lg mb-4`}
                      >
                        <div className="flex items-start justify-between gap-8">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${statusConfig.iconBg}`}>
                              {getStatusIcon(payment.status)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-base font-semibold text-gray-900">
                                  Payment #{payment.id}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full 
                                  text-xs font-medium ring-1 ring-inset ${statusConfig.colors}`}>
                                  {payment.status.toLowerCase()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-md bg-gray-100 
                                  font-medium ${statusConfig.timeColor}`}>
                                  {time}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {getPaymentMethodIcon(payment.method) && (
                                  <div className="relative w-8 h-8 rounded-md overflow-hidden 
                                    border border-gray-200 bg-white">
                                    <Image
                                      src={getPaymentMethodIcon(payment.method)!}
                                      alt={payment.method}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-700">
                                  {payment.method}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono bg-gray-50/80 
                                  px-3 py-1.5 rounded-md border border-gray-100">
                                  {payment.transactionId}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                              रु {payment.amount.toLocaleString('en-IN')}
                            </p>
                            {payment.status === 'COMPLETED' && (
                              <p className={`text-xs ${statusConfig.timeColor}`}>
                                Completed at {formatDate(payment.updatedAt).time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
