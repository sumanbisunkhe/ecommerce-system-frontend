'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { Package2, Loader2, Clock, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
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
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
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

  const handleDeleteOrder = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.paymentStatus === 'COMPLETED') {
      notify.error('Completed orders cannot be deleted');
      setDeleteOrderId(null);
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(
        `http://localhost:8080/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete order');

      setOrders(orders.filter(order => order.id !== orderId));
      notify.success('Order deleted successfully');
    } catch (error: any) {
      notify.error(error.message);
    }
    setDeleteOrderId(null);
  };

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

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Sort status groups in specific order
  const statusOrder = ['PENDING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  const sortedGroups = Object.entries(groupedOrders).sort(([a], [b]) => 
    statusOrder.indexOf(a) - statusOrder.indexOf(b)
  );

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
      
      {deleteOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteOrderId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteOrderId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with updated styling */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100/50 rounded-lg">
                  <Package2 className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
              </div>
              <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
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
            <div className="space-y-6 p-6">
              {sortedGroups.map(([status, statusOrders]) => (
                <div key={status} className="space-y-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 px-4">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    {status.charAt(0) + status.slice(1).toLowerCase()} Orders
                    <span className="text-sm font-normal text-gray-500">({statusOrders.length})</span>
                  </h2>
                  <div className="grid gap-4">
                    {statusOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <Link 
                              href={`/customer/orders/${order.id}`}
                              className="flex-1"
                            >
                              <div className="space-y-4">
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                    #{order.id}
                                  </span>
                                  {getStatusBadge(order.status, 'delivery')}
                                  {getStatusBadge(order.paymentStatus, 'payment')}
                                </div>

                                {/* Order Content */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-3">
                                  {/* Items Preview */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-300">
                                      {order.items.slice(0, 3).map((item) => (
                                        <div 
                                          key={item.productId} 
                                          className="relative w-10 h-10 rounded-lg ring-2 ring-white bg-white"
                                        >
                                          <Image
                                            src={item.product?.imageUrl || '/product-placeholder.png'}
                                            alt={item.product?.name || 'Product'}
                                            fill
                                            className="object-cover rounded-lg p-1"
                                          />
                                        </div>
                                      ))}
                                      {order.items.length > 3 && (
                                        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-white flex items-center justify-center">
                                          <span className="text-xs font-medium text-blue-600">
                                            +{order.items.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                  </div>

                                  {/* Price and Address */}
                                  <div className="flex items-center justify-between flex-1 gap-4">
                                    <div className="text-sm text-gray-600">
                                      <span className="inline-block px-2 py-1 bg-gray-50 rounded-md">
                                        📍 {order.shippingAddress}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-blue-600">
                                        रु{order.totalAmount.toLocaleString('en-IN')}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Incl. रु{order.shippingCost.toLocaleString('en-IN')} shipping
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            {order.paymentStatus !== 'COMPLETED' && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDeleteOrderId(order.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete order"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
