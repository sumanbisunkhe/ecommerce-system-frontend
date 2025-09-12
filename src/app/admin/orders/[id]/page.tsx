'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package2, User, MapPin, CreditCard, ClipboardList } from 'lucide-react';
import { Funnel_Sans, Markazi_Text } from 'next/font/google';

// Fonts
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    totalPrice: number;
}

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

interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    shippingAddress: string;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [productCache, setProductCache] = useState<Record<number, Product>>({});
    const [userCache, setUserCache] = useState<Record<number, User | null>>({});

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];

                const response = await fetch(`http://localhost:8080/orders/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch order details');
                const data = await response.json();

                if (data.success) {
                    setOrder(data.data);
                    // Fetch product and user details
                    fetchUser(data.data.userId);
                    data.data.items.forEach((item: OrderItem) => {
                        fetchProduct(item.productId);
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

        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const fetchProduct = async (productId: number) => {
        if (productCache[productId]) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(`http://localhost:8080/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            const data = await response.json();

            if (data.success) {
                const product = data.data;
                setProductCache((prev) => ({
                    ...prev,
                    [productId]: { id: product.id, name: product.name, price: product.price },
                }));
            }
        } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
        }
    };

    const fetchUser = async (userId: number) => {
        if (userCache[userId]) return;

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();

            if (data.success) {
                const user = data.data;
                setUserCache((prev) => ({
                    ...prev,
                    [userId]: { id: user.id, username: user.username, email: user.email },
                }));
            }
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
        }
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Order not found</div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 px-3 py-3 mt-5 rounded-lg ${funnelSans.className}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left section: Back + Order ID */}
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/orders"
                                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <h1 className={`${markaziText.className} text-2xl font-semibold text-gray-900`}>
                                Order #{order.id}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>


            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Details Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center">
                                    <Package2 className="h-5 w-5 text-gray-400 mr-2" />
                                    <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {order.items.map((item, index) => (
                                    <div key={index} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {productCache[item.productId]?.name || 'Loading...'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatPrice(item.price)} each
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(item.totalPrice)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="px-6 py-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-900">Total Amount</div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {formatPrice(order.totalAmount)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center">
                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                    <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                {userCache[order.userId] ? (
                                    <>
                                        <div className="text-sm font-medium text-gray-900">
                                            {userCache[order.userId]?.username}
                                        </div>
                                        <div className="text-sm text-gray-500">{userCache[order.userId]?.email}</div>
                                    </>
                                ) : (
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Status Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center">
                                    <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
                                    <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                                </div>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Order Status</div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Payment Status</div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getPaymentStatusColor(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                                    <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <div className="text-sm text-gray-600">{order.shippingAddress}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}