/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp, ShoppingBag, CreditCard, Package, CheckCircle, Clock } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Link from 'next/link';
import { Funnel_Sans, Markazi_Text } from 'next/font/google';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { RiVipCrownFill } from 'react-icons/ri';
import { BASE_URL } from '@/config/api';

const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface UserAnalytics {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  profileImage: string;
  isActive: boolean;
  joinedDate: string;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAmount: number;
  lastOrderDate: string;
  cartItemsCount: number;
  cartTotalValue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  favoriteCategories: string[];
  loyaltyTier: string;
  ordersLast30Days: number;
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Enhanced Order Distribution Chart
const OrderDistributionChart = ({ analytics }: { analytics: UserAnalytics }) => {
  const data = {
    labels: ['Delivered', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [analytics.deliveredOrders, analytics.pendingOrders, analytics.cancelledOrders],
        backgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(251, 191, 36, 0.9)',
          'rgba(239, 68, 68, 0.9)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="relative h-64">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 12,
                  weight: '500',
                },
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold',
              },
              bodyFont: {
                size: 13,
              },
              cornerRadius: 8,
            },
          },
          cutout: '70%',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
      </div>
    </div>
  );
};

// Category Performance Chart
const CategoryChart = ({ categories }: { categories: string[] }) => {
  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Orders',
        data: [45, 32, 28],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="relative h-64">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

// Spending Trend Chart
const SpendingTrendChart = ({ totalSpent }: { totalSpent: number }) => {
  const monthlyData = Array.from({ length: 6 }, (_, i) => 
    Math.floor(totalSpent / 6 + (Math.random() - 0.5) * (totalSpent / 10))
  );

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Spending',
        data: monthlyData,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
    ],
  };

  return (
    <div className="relative h-64">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return `Spent: ${formatCurrency(context.parsed.y)}`;
                }
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                },
                font: {
                  size: 11,
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

// Modern Hero Card
const HeroCard = ({ icon: Icon, label, value, trend, color, bgColor }: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  bgColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-opacity-20`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
    <div className="text-3xl font-bold text-gray-900">
      {typeof value === 'number' ? (
        <CountUp
          end={value}
          duration={2.5}
          separator=","
          decimal="."
          decimals={0}
        />
      ) : (
        value
      )}
    </div>
  </motion.div>
);

// Info Card Component
const InfoCard = ({ title, children, className = '' }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}
  >
    <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
    {children}
  </motion.div>
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (!userCookie) throw new Error('User not found');

        const userData = JSON.parse(decodeURIComponent(userCookie));
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        const response = await fetch(`${BASE_URL}/analytics/users/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const { data } = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-600 font-medium">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  const successRate = ((analytics.successfulPayments / analytics.totalPayments) * 100).toFixed(1);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${funnelSans.className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/customer/products" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className={`${markaziText.className} text-2xl font-bold text-gray-900`}>
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Member since {new Date(analytics.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2
                ${analytics.loyaltyTier === 'Gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                  analytics.loyaltyTier === 'Silver' ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                    'bg-gradient-to-r from-amber-600 to-amber-800 text-white'}`}>
                <RiVipCrownFill className="h-5 w-5" />
                <span>{analytics.loyaltyTier} Tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <HeroCard
            icon={ShoppingBag}
            label="Total Orders"
            value={analytics.totalOrders}
            trend={`${analytics.ordersLast30Days} this month`}
            color="text-blue-600"
            bgColor="bg-white"
          />
          <HeroCard
            icon={TrendingUp}
            label="Total Spent"
            value={formatCurrency(analytics.totalSpent)}
            color="text-purple-600"
            bgColor="bg-white"
          />
          <HeroCard
            icon={Package}
            label="Avg. Order Value"
            value={formatCurrency(analytics.averageOrderValue)}
            color="text-green-600"
            bgColor="bg-white"
          />
          <HeroCard
            icon={CreditCard}
            label="Payment Success"
            value={`${successRate}%`}
            trend={`${analytics.successfulPayments}/${analytics.totalPayments}`}
            color="text-emerald-600"
            bgColor="bg-white"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Distribution */}
          <InfoCard title="Order Status Distribution" className="lg:col-span-1">
            <OrderDistributionChart analytics={analytics} />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.deliveredOrders}</p>
                <p className="text-xs text-gray-500">Delivered</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingOrders}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-2">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.cancelledOrders}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>
          </InfoCard>

          {/* Spending Trend */}
          <InfoCard title="Spending Trend (Last 6 Months)" className="lg:col-span-2">
            <SpendingTrendChart totalSpent={analytics.totalSpent} />
          </InfoCard>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Categories */}
          <InfoCard title="Top Categories">
            <CategoryChart categories={analytics.favoriteCategories} />
            <div className="mt-6 space-y-3">
              {analytics.favoriteCategories.map((category, index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-pink-500'}`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* Recent Activity */}
          <InfoCard title="Recent Activity" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <p className="text-sm font-medium opacity-90 mb-2">Last Order</p>
                  <p className="text-3xl font-bold mb-1">{formatCurrency(analytics.lastOrderAmount)}</p>
                  <p className="text-sm opacity-75">{formatDate(analytics.lastOrderDate)}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <p className="text-sm font-medium opacity-90 mb-2">Current Cart</p>
                  <p className="text-3xl font-bold mb-1">{formatCurrency(analytics.cartTotalValue)}</p>
                  <p className="text-sm opacity-75">{analytics.cartItemsCount} items</p>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalPayments}</p>
                  <p className="text-sm text-gray-600 mt-1">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics.successfulPayments}</p>
                  <p className="text-sm text-gray-600 mt-1">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analytics.failedPayments}</p>
                  <p className="text-sm text-gray-600 mt-1">Failed</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{successRate}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${successRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}