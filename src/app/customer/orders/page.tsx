'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { Package2, Loader2, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Link from 'next/link';

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
  shippingCost: number;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    size: 20,
    number: 0,
    totalElements: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
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
          `http://localhost:8080/orders/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        if (data.success) {
          // Fetch product details for each order item
          const ordersWithProducts = await Promise.all(
            data.data.content.map(async (order: Order) => ({
              ...order,
              items: await Promise.all(
                order.items.map(async (item: OrderItem) => {
                  try {
                    const productResponse = await fetch(
                      `http://localhost:8080/products/${item.productId}`,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Accept': 'application/json'
                        }
                      }
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
                  } catch (error) {
                    console.error(`Failed to fetch product ${item.productId}:`, error);
                    return item;
                  }
                })
              )
            }))
          );
          
          setOrders(ordersWithProducts);
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

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string, type: 'delivery' | 'payment') => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800 ring-green-600/20',
      CANCELLED: 'bg-red-100 text-red-800 ring-red-600/20',
      PENDING: 'bg-amber-100 text-amber-800 ring-amber-600/20',
      SHIPPED: 'bg-blue-100 text-blue-800 ring-blue-600/20',
      DELIVERED: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
      FAILED: 'bg-red-100 text-red-800 ring-red-600/20',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 ring-gray-600/20'}`}>
        {type}: {status.toLowerCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gray-50 pt-20`}>
      <NotificationProvider />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
              </div>
              <span className="text-sm text-gray-500">
                {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'order' : 'orders'} total
              </span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">When you place orders, they'll appear here.</p>
              <Link 
                href="/customer/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 p-6">
              {orders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/customer/orders/${order.id}`}
                  className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            Order #{order.id}
                          </span>
                          {getStatusBadge(order.status, 'delivery')}
                          {getStatusBadge(order.paymentStatus, 'payment')}
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-4 hover:-space-x-2 transition-all duration-300">
                            {order.items.slice(0, 4).map((item) => (
                              <div 
                                key={item.productId} 
                                className="relative w-12 h-12 rounded-xl ring-4 ring-white group-hover:ring-blue-50 transition-all duration-300"
                              >
                                <Image
                                  src={item.product?.imageUrl || '/product-placeholder.png'}
                                  alt={item.product?.name || 'Product'}
                                  fill
                                  className="object-cover rounded-xl bg-white p-2"
                                />
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-4 ring-white group-hover:ring-blue-50 flex items-center justify-center transition-all duration-300">
                                <span className="text-sm font-semibold text-blue-600">
                                  +{order.items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600">
                          📍 {order.shippingAddress}
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="lg:text-right lg:border-l lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 mt-4 lg:mt-0">
                        <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                          रु{order.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <p className="text-sm text-gray-500">
                          Includes रु{order.shippingCost.toLocaleString('en-IN')} shipping
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
