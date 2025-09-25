/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { Funnel_Sans } from 'next/font/google';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';
import debounce from 'lodash/debounce';
import { BASE_URL } from '@/config/api';

const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });

interface Product {
    id: number;
    name: string;
    price: number;
}

interface User {
    id: number;
    username: string;
    email: string;
}

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    totalPrice: number;
    product?: Product;
}

interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    shippingAddress: string;
}

interface PageInfo {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

type TimeFilter = 'ALL' | 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_YEAR';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        size: 5,
        number: 0,
        totalElements: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [productCache, setProductCache] = useState<Record<number, Product>>({});
    const [userCache, setUserCache] = useState<Record<number, User>>({});
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Debounced search
    const debouncedSearch = debounce((value: string) => {
        setSearchTerm(value);
        setPageInfo(prev => ({ ...prev, number: 0 }));
    }, 500);

    // Fetch orders
    const fetchOrders = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(
                `${BASE_URL}/orders?filter=${timeFilter}&search=${searchTerm}&page=${pageInfo.number}&size=${pageInfo.size}&sortBy=${sortBy}&ascending=${sortOrder === 'asc'}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();

            if (data.success) {
                const orders = data.data.content;
                setOrders(orders);
                setPageInfo(prev => ({
                    ...prev,
                    totalElements: data.data.page.totalElements,
                    totalPages: data.data.page.totalPages,
                }));

                // Fetch missing product and user details
                orders.forEach((order: Order) => {
                    // Fetch user info if not cached
                    if (!userCache[order.userId]) {
                        fetchUser(order.userId);
                    }

                    // Fetch product info for each item if not cached
                    order.items.forEach((item: OrderItem) => {
                        if (!productCache[item.productId]) {
                            fetchProduct(item.productId);
                        }
                    });
                });
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProduct = async (productId: number) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(`${BASE_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            const data = await response.json();

            if (data.success) {
                const product = data.data;
                setProductCache(prev => ({
                    ...prev,
                    [productId]: { id: product.id, name: product.name, price: product.price }
                }));
            }
        } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
        }
    };

    const fetchUser = async (userId: number) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();

            if (data.success) {
                const user = data.data;
                setUserCache(prev => ({
                    ...prev,
                    [userId]: { id: user.id, username: user.username, email: user.email }
                }));
            }
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800 ring-blue-600/20';
            case 'SHIPPED':
                return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 ring-green-600/20';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 ring-red-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-gray-600/20';
        }
    };

    const getPaymentStatusColor = (status: Order['paymentStatus']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 ring-green-600/20';
            case 'FAILED':
                return 'bg-red-100 text-red-800 ring-red-600/20';
            case 'REFUNDED':
                return 'bg-purple-100 text-purple-800 ring-purple-600/20';
            default:
                return 'bg-gray-100 text-gray-800 ring-gray-600/20';
        }
    };

    const formatPrice = (price: number) => {
        return `रु ${price.toFixed(2)}`;
    };

    const getSortIcon = () => {
        return sortOrder === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
        ) : (
            <ArrowDown className="w-4 h-4" />
        );
    };

    // Skeleton loader
    const renderSkeletonRows = () =>
        Array.from({ length: pageInfo.size }).map((_, idx) => (
            <tr key={idx}>
                {Array.from({ length: 7 }).map((_, tdIdx) => (
                    <td key={tdIdx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                ))}
            </tr>
        ));

    return (
        <div className={funnelSans.className}>
            <main className="space-y-6 px-4">
                <NotificationProvider />

                {/* Filters and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                {/* Search */}
                                <div className="flex-1 min-w-[300px] relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSearch className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                        onChange={e => debouncedSearch(e.target.value)}
                                    />
                                </div>

                                {/* Time Filter */}
                                <div className="min-w-[200px]">
                                    <select
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={timeFilter}
                                        onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                                    >
                                        <option value="ALL">All Time</option>
                                        <option value="LAST_WEEK">Last Week</option>
                                        <option value="LAST_MONTH">Last Month</option>
                                        <option value="LAST_YEAR">Last Year</option>
                                    </select>
                                </div>

                                {/* Sort Control */}
                                <div className="flex items-center min-w-[200px]">
                                    <div className="relative flex-1">
                                        <select
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                        >
                                            <option value="createdAt">Order Date</option>
                                            <option value="totalAmount">Total Amount</option>
                                            <option value="status">Status</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))}
                                        className="ml-2 p-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                                    >
                                        {getSortIcon()}
                                    </button>
                                </div>

                                {/* Page Size */}
                                <div className="min-w-[120px]">
                                    <select
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={pageInfo.size}
                                        onChange={e => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), number: 0 }))}
                                    >
                                        {[5, 10, 20, 50, 100].map(n => (
                                            <option key={n} value={n}>
                                                {n} per page
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Results Summary */}
                        {!isLoading && !error && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>
                                        Showing <span className="font-semibold text-gray-900">{orders.length}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{pageInfo.totalElements}</span> orders
                                    </span>
                                </div>
                                {searchTerm && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Filtered by:</span>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                                            "{searchTerm}"
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Orders Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User Info
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    renderSkeletonRows()
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            No orders found. Orders will appear here once customers start placing them.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {userCache[order.userId] ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{userCache[order.userId].username}</div>
                                                        <div className="text-gray-500">{userCache[order.userId].email}</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(order.totalAmount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getPaymentStatusColor(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2"
                                                >
                                                    <FiEye className="w-4 h-4" />

                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && !error && pageInfo.totalPages > 0 && (
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Page <span className="font-medium">{pageInfo.number + 1}</span> of{' '}
                                    <span className="font-medium">{pageInfo.totalPages}</span>
                                </div>
                                <Pagination
                                    currentPage={pageInfo.number + 1}
                                    totalPages={pageInfo.totalPages}
                                    onPageChange={page => setPageInfo(prev => ({ ...prev, number: page - 1 }))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}