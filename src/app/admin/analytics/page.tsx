'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Users, Package, ShoppingBag, TrendingUp, TrendingDown, ArrowUpRight,
    Calendar, RefreshCw, Download,
    DollarSign, BarChart3
} from 'lucide-react';
import Image from 'next/image';
import { BASE_URL } from '@/config/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Analytics {
    totalUsers: number;
    totalRevenue: number;
    totalRevenueLastMonth: number;
    activeUsers: number;
    inactiveUsers: number;
    maleUsers: number;
    femaleUsers: number;
    otherGenderUsers: number;
    usersFromTenToTwenty: number;
    usersFromTwentyToThirty: number;
    usersAboveThirty: number;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    newProducts: Array<{
        id: number;
        name: string;
        price: number;
        imageUrl: string;
        createdAt: string;
    }>;
    popularProducts: Array<{
        id: number;
        name: string;
        price: number;
        imageUrl: string;
    }>;
    totalCategories: number;
    newCategories: Array<{
        id: number;
        name: string;
        description: string;
        createdAt: string;
    }>;
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalPayments: number;
    paymentViaKhalti: number;
    paymentViaCashOnDelivery: number;
    paymentViaCreditCard: number;
    paymentViaDebitCard: number;
    paymentViaEsewa: number;
    paymentViaBankTransfer: number;
    pendingPayment: number;
    completedPayment: number;
    failedPayment: number;
    refundedPayment: number;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(`${BASE_URL}/analytics/system`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
                setLastUpdated(new Date().toLocaleTimeString());
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const formatPrice = (price: number) => {
        return `रु ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Prepare data for charts
    const orderStatusData = [
        { name: 'Pending', value: analytics?.pendingOrders || 0, color: '#f59e0b' },
        { name: 'Confirmed', value: analytics?.confirmedOrders || 0, color: '#3b82f6' },
        { name: 'Shipped', value: analytics?.shippedOrders || 0, color: '#8b5cf6' },
        { name: 'Delivered', value: analytics?.deliveredOrders || 0, color: '#10b981' },
        { name: 'Cancelled', value: analytics?.cancelledOrders || 0, color: '#ef4444' },
    ];

    const paymentMethodData = [
        { name: 'Khalti', value: analytics?.paymentViaKhalti || 0 },
        { name: 'Cash on Delivery', value: analytics?.paymentViaCashOnDelivery || 0 },
        { name: 'Credit Card', value: analytics?.paymentViaCreditCard || 0 },
        { name: 'Debit Card', value: analytics?.paymentViaDebitCard || 0 },
        { name: 'Esewa', value: analytics?.paymentViaEsewa || 0 },
        { name: 'Bank Transfer', value: analytics?.paymentViaBankTransfer || 0 },
    ];

    const userDemographicsData = [
        { name: 'Male', value: analytics?.maleUsers || 0 },
        { name: 'Female', value: analytics?.femaleUsers || 0 },
        { name: 'Other', value: analytics?.otherGenderUsers || 0 },
    ];

    // Mock revenue data (would come from API in a real app)
    const revenueData = [
        { month: 'Jan', revenue: 12000 },
        { month: 'Feb', revenue: 19000 },
        { month: 'Mar', revenue: 15000 },
        { month: 'Apr', revenue: 25000 },
        { month: 'May', revenue: 22000 },
        { month: 'Jun', revenue: 30000 },
        { month: 'Jul', revenue: 28000 },
        { month: 'Aug', revenue: 35000 },
        { month: 'Sep', revenue: 32000 },
    ];

    // Mock user growth data (would come from API in a real app)
    const userGrowthData = [
        { month: 'Jan', users: 5 },
        { month: 'Feb', users: 15 },
        { month: 'Mar', users: 10 },
        { month: 'Apr', users: 8 },
        { month: 'May', users: 12 },
        { month: 'Jun', users: 18 },
        { month: 'Jul', users: 14 },
        { month: 'Aug', users: 20 },
        { month: 'Sep', users: 13 },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <BarChart3 className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Error Loading Analytics</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">No analytics data available</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-5">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <p className="text-sm text-gray-500">Comprehensive overview of your business performance</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* <div className="relative">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="ytd">Year to date</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div> */}
                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                                <Download className="w-4 h-4 mr-1" />
                                Export
                            </button>
                            <button
                                onClick={fetchAnalytics}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Users Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-indigo-50">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">
                                {analytics.activeUsers} active
                            </span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-gray-500">
                                {analytics.inactiveUsers} inactive
                            </span>
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-semibold text-gray-900">{analytics.totalProducts}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">
                                {analytics.newProducts.length} new
                            </span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-gray-500">
                                {analytics.popularProducts.length} popular
                            </span>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-green-50">
                                <ShoppingBag className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-semibold text-gray-900">{analytics.totalOrders}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-600 font-medium">
                                {analytics.deliveredOrders} delivered
                            </span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-amber-600">
                                {analytics.pendingOrders} pending
                            </span>
                        </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-purple-50">
                                <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    रु {analytics.totalRevenue}
                                </p>
                            </div>
                        </div>

                        {/* Calculate growth/decline */}
                        {analytics.totalRevenueLastMonth !== 0 && (
                            (() => {
                                const diff = analytics.totalRevenue - analytics.totalRevenueLastMonth
                                const percent = ((diff / analytics.totalRevenueLastMonth) * 100).toFixed(1)
                                const isPositive = diff >= 0

                                return (
                                    <div
                                        className={`mt-4 flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {isPositive ? (
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 mr-1" />
                                        )}
                                        {percent}% {isPositive ? 'from' : 'lower than'} last month
                                    </div>
                                )
                            })()
                        )}
                    </div>
                </div>


                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                Last 9 months
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" tickFormatter={(value) => `रु ${value}`} />
                                    <Tooltip formatter={(value) => [`रु ${value}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#eef2ff" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Status Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                            <div className="text-sm text-gray-500">{analytics.totalOrders} total orders</div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orderStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* User Demographics */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">User Demographics</h2>
                        <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userDemographicsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {userDemographicsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                    <span className="text-gray-600">Male</span>
                                </div>
                                <span className="font-semibold">{analytics.maleUsers}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                                    <span className="text-gray-600">Female</span>
                                </div>
                                <span className="font-semibold">{analytics.femaleUsers}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                    <span className="text-gray-600">Other</span>
                                </div>
                                <span className="font-semibold">{analytics.otherGenderUsers}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h2>
                        <div className="h-64 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                    <span className="text-gray-600">Khalti</span>
                                </div>
                                <span className="font-semibold">{analytics.paymentViaKhalti}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                    <span className="text-gray-600">Cash on Delivery</span>
                                </div>
                                <span className="font-semibold">{analytics.paymentViaCashOnDelivery}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                    <span className="text-gray-600">Credit Card</span>
                                </div>
                                <span className="font-semibold">{analytics.paymentViaCreditCard}</span>
                            </div>
                        </div>
                    </div>

                    {/* User Growth */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                            <div className="flex items-center text-sm text-green-600 font-medium">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                18.2%
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* New Products */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">New Products</h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                                View all <ArrowUpRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {analytics.newProducts.slice(0, 4).map((product) => (
                                <div key={product.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                                    </div>
                                    <div className="text-xs text-gray-500">{formatDate(product.createdAt)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Products */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Popular Products</h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                                View all <ArrowUpRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {analytics.popularProducts.map((product) => (
                                <div key={product.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                                    </div>
                                    <div className="flex items-center text-sm text-green-600 font-medium">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Top seller
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 ">
                <div className="flex items-center text-sm text-gray-500">
                    <p>Last updated: {lastUpdated}</p>
                </div>
            </footer>
        </div>
    );
}