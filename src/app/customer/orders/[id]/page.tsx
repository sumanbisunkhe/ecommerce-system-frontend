'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Package2, Loader2, ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle, Banknote
} from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import Image from 'next/image';
import Link from 'next/link';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';

const funnelSans = Funnel_Sans({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    totalPrice: number;
    product?: {
        name: string;
        imageUrl: string;
    };
}

interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: string;
    shippingCost: number | null;
}

interface PaymentResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  purchase_order_id: string | null;
  purchase_order_name: string | null;
}

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<'KHALTI' | 'COD'>('KHALTI');
    const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('token='))
                    ?.split('=')[1];

                const orderResponse = await fetch(`http://localhost:8080/orders/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });

                if (!orderResponse.ok) throw new Error('Failed to fetch order');

                const orderData = await orderResponse.json();
                if (!orderData.success) throw new Error(orderData.message);

                const orderWithProducts = {
                    ...orderData.data,
                    items: await Promise.all(
                        orderData.data.items.map(async (item: OrderItem) => {
                            try {
                                const productResponse = await fetch(
                                    `http://localhost:8080/products/${item.productId}`,
                                    { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
                                );
                                if (!productResponse.ok) throw new Error('Failed to fetch product');
                                const productData = await productResponse.json();
                                return {
                                    ...item,
                                    product: {
                                        name: productData.data.name,
                                        imageUrl: productData.data.imageUrl,
                                    }
                                };
                            } catch {
                                return item;
                            }
                        })
                    )
                };

                setOrder(orderWithProducts);
            } catch (error: any) {
                notify.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'CANCELLED': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'PENDING': return <Clock className="h-5 w-5 text-amber-500" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-50 text-green-700';
            case 'CANCELLED': return 'bg-red-50 text-red-700';
            case 'PENDING': return 'bg-amber-50 text-amber-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

   const initiatePayment = async () => {
    try {
        setIsInitiatingPayment(true);
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        // This is correct - using query parameter
        const response = await fetch(
            `http://localhost:8080/payment/initiate?orderId=${id}`,
            {
                method: 'POST', // Ensure this is a POST request
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) throw new Error('Failed to initiate payment');

        const data = await response.json();
        if (data.success) {
            window.location.href = data.data.payment_url;
        } else {
            throw new Error(data.message);
        }
    } catch (error: any) {
        notify.error(error.message);
    } finally {
        setIsInitiatingPayment(false);
    }
};

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <Package2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Order not found</h3>
                <p className="text-gray-500 mb-4">This order might have been deleted or doesn't exist.</p>
                <Link href="/customer/orders" className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 font-medium">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className={`${funnelSans.className} container mx-auto px-20 py-8 pt-24 space-y-6`}>
            <NotificationProvider />

            {/* Order Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                    <Link href="/customer/orders" className="inline-flex items-center text-gray-900 hover:text-gray-700">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden md:inline font-medium"></span>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 mt-2 md:mt-0">Order #{order.id}</h1>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                    </span>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus}
                    </span>
                    <div className="text-right mt-1 md:mt-0">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">रु{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Row */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Items - 60% width */}
                <div className="lg:w-[60%]">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                        {order.items.map((item) => (
                            <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
                                    <Image
                                        src={item.product?.imageUrl || '/product-placeholder.png'}
                                        alt={item.product?.name || 'Product'}
                                        fill
                                        className="object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 text-lg">{item.product?.name || 'Product Name Unavailable'}</h3>
                                    <div className="mt-1 flex flex-wrap sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                                        <p>Unit Price: रु{item.price.toLocaleString('en-IN')}</p>
                                        <span className="hidden sm:inline">•</span>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right mt-2 sm:mt-0">
                                    <p className="font-semibold text-blue-600 text-lg">रु{item.totalPrice.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary - 40% width */}
                <div className="lg:w-[40%]">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
                        {/* Shipping Address */}
                        <div>
                            <h2 className="font-medium text-gray-900 mb-2 text-lg">Shipping Address</h2>
                            <p className="text-gray-600">{order.shippingAddress}</p>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-200" />

                        {/* Order Summary */}
                        <div className="space-y-2 text-gray-700">
                            <h2 className="font-medium text-gray-900 mb-3 text-lg">Order Summary</h2>
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span className="font-medium">रु{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Shipping Cost:</span>
                                <span className="font-medium">{order.shippingCost ? `रु${order.shippingCost.toLocaleString('en-IN')}` : 'Free'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-blue-600">
                                <span>Total:</span>
                                <span>रु{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Options and Confirm Order Button */}
            <div className="flex justify-between items-center bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Select Payment Method</h3>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                value="KHALTI"
                                checked={selectedPayment === 'KHALTI'}
                                onChange={(e) => setSelectedPayment(e.target.value as 'KHALTI')}
                                className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="flex items-center gap-2">
                                <img
                                    src="https://res.cloudinary.com/dxql0x0iq/image/upload/v1757784401/khalti_yv4jqo.png"
                                    alt="Khalti"
                                    className="h-6"
                                />

                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                checked={selectedPayment === 'COD'}
                                onChange={(e) => setSelectedPayment(e.target.value as 'COD')}
                                className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="flex items-center gap-2">
                                 <img
                                    src="https://res.cloudinary.com/dxql0x0iq/image/upload/c_crop,w_1572,h_652/v1757784762/money_a5sbxj.jpg"
                                    alt="Khalti"
                                    className="h-8"
                                />
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (selectedPayment === 'KHALTI') {
                            initiatePayment();
                        } else {
                            notify.success('Order confirmed with Cash on Delivery!');
                            // Add COD logic here
                        }
                    }}
                    disabled={!selectedPayment || isInitiatingPayment}
                    className={`px-6 py-3 font-semibold rounded-lg flex items-center gap-2 shadow-md
                        ${!selectedPayment || isInitiatingPayment
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                        } transition-all duration-200`}
                >
                    {isInitiatingPayment ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Initiating Payment...
                        </>
                    ) : (
                        <>
                            Confirm Order
                            <CheckCircle2 className="h-5 w-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
