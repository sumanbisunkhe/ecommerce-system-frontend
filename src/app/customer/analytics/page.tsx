/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Package2} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
import { FiTrendingUp, FiBarChart2, FiClock, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
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
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Add Order Distribution Chart Component
const OrderDistributionChart = ({ analytics }: { analytics: UserAnalytics }) => {
  const data = {
    labels: ['Pending', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [analytics.pendingOrders, analytics.deliveredOrders, analytics.cancelledOrders],
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative h-48">
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
          },
        }}
      />
    </div>
  );
};

// Add Spending Trend Chart Component
const SpendingTrendChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Spending',
        data: [300, 450, 320, 670, 540, 800],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="relative h-48">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, className = '' }: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden group rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all duration-300 p-6 ${className}`}
  >
    <div className="flex items-start gap-4">
      <div className="rounded-lg p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {typeof value === 'number' ? (
            <CountUp
              end={value}
              duration={2}
              separator=", "
              decimal="."
              decimals={typeof value === 'number' && value % 1 !== 0 ? 2 : 0}
              prefix={typeof value === 'number' && value > 100 ? '$' : ''}
            />
          ) : (
            value
          )}
        </div>
        {subValue && (
          <p className="text-sm text-gray-500 mt-1 group-hover:text-blue-600 transition-colors">
            {subValue}
          </p>
        )}
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
  </motion.div>
);

// Enhanced Analytics Card Component
const AnalyticsCard = ({ title, icon: Icon, children, className = '' }: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
  >
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <Icon className="h-5 w-5 text-blue-600" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 ${funnelSans.className}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Enhanced Header with User Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/customer/products" className="text-gray-600 hover:text-gray-900">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className={`${markaziText.className} text-2xl font-bold text-gray-900`}>
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Member since {formatDate(analytics.joinedDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RiVipCrownFill className={`h-6 w-6 ${analytics.loyaltyTier === 'Gold' ? 'text-yellow-500' :
                  analytics.loyaltyTier === 'Silver' ? 'text-gray-400' :
                    'text-amber-700'
                }`} />
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${analytics.loyaltyTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                    analytics.loyaltyTier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'}`}>
                  {analytics.loyaltyTier} Member
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.isActive ? 'Active Account' : 'Inactive Account'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <AnalyticsCard title="Order Statistics" icon={FiShoppingBag} className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard
                icon={Package2}
                label="Total Orders"
                value={analytics.totalOrders}
                subValue={`${analytics.ordersLast30Days} in last 30 days`}
              />
              <StatCard
                icon={FiClock}
                label="Pending Orders"
                value={analytics.pendingOrders}
              />
              <StatCard
                icon={FiBarChart2}
                label="Delivered Orders"
                value={analytics.deliveredOrders}
              />
              <StatCard
                icon={Package2}
                label="Cancelled Orders"
                value={analytics.cancelledOrders}
              />
            </div>
            <div className="mt-6">
              <OrderDistributionChart analytics={analytics} />
            </div>
          </AnalyticsCard>

          {/* Financial Overview */}
          <AnalyticsCard title="Financial Overview" icon={FiDollarSign}>
            <div className="space-y-6">
              <StatCard
                icon={FiTrendingUp}
                label="Total Spent"
                value={formatCurrency(analytics.totalSpent)}
                subValue={`Avg. ${formatCurrency(analytics.averageOrderValue)} per order`}
              />
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-600 mb-3">Payment Success Rate</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {analytics.successfulPayments} of {analytics.totalPayments} payments
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {((analytics.successfulPayments / analytics.totalPayments) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(analytics.successfulPayments / analytics.totalPayments) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </AnalyticsCard>

          {/* Recent Activity */}
          <AnalyticsCard title="Recent Activity" icon={FiClock} className="lg:col-span-2">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Last Order</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.lastOrderAmount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(analytics.lastOrderDate)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Current Cart</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.cartTotalValue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.cartItemsCount} items
                  </p>
                </div>
              </div>
              <SpendingTrendChart />
            </div>
          </AnalyticsCard>

          {/* Favorite Categories */}
          <AnalyticsCard title="Top Categories" icon={FiBarChart2}>
            <div className="space-y-4">
              {analytics.favoriteCategories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${index === 0 ? 'bg-blue-600' :
                      index === 1 ? 'bg-purple-600' :
                        'bg-green-600'} text-white font-bold`}>
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{category}</span>
                </motion.div>
              ))}
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
}