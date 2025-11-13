/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Funnel_Sans } from "next/font/google";
import { Package2, History, Clock, CheckCircle2, XCircle, AlertCircle, X, ChevronRight, Sparkles, TrendingUp, Package } from 'lucide-react';
import Image from 'next/image';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Link from 'next/link';
import { BASE_URL } from '@/config/api';


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

// Add new interfaces for sidebar products
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity?: number;
  // ...other product fields if needed...
}

interface RecommendedProduct extends Product {
  recommendationType: 'COLLABORATIVE' | 'CONTENT_BASED';
  recommendationScore: number;
}

interface SystemAnalytics {
  success: boolean;
  message: string;
  data: {
    popularProducts: Product[];
    newProducts: Product[];
    // ... other fields not needed for this feature
  };
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

  // New sidebar states
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

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
          `${BASE_URL}/orders/users/${userId}`,
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
                      `${BASE_URL}/products/${item.productId}`,
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

    // New: fetch recommendations, popular and new products
    const fetchSidebarData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        // Fetch system analytics for popular and new products
        const analyticsResp = await fetch(`${BASE_URL}/analytics/system`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (analyticsResp.ok) {
          const analytics: SystemAnalytics = await analyticsResp.json();
          if (analytics.success) {
            setPopularProducts(analytics.data.popularProducts || []);
            setNewProducts(analytics.data.newProducts || []);
          }
        }

        // Fetch personalized recommendations if user exists
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (!userCookie) return;
        const userData = JSON.parse(decodeURIComponent(userCookie));
        const userId = userData.id;

        try {
          const recResp = await fetch(`${BASE_URL}/recommendations/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!recResp.ok) throw new Error('Failed to fetch recommendations');
          const recData = await recResp.json();
          if (recData.success) {
            const prodDetails = await Promise.all(
              recData.data.map(async (rec: any) => {
                try {
                  const pResp = await fetch(`${BASE_URL}/products/${rec.productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const pData = await pResp.json();
                  return {
                    ...pData.data,
                    recommendationType: rec.type,
                    recommendationScore: rec.score,
                  } as RecommendedProduct;
                } catch (e) {
                  console.error('Failed to fetch recommended product details', e);
                  return null;
                }
              })
            );
            setRecommendedProducts(prodDetails.filter(Boolean) as RecommendedProduct[]);
          }
        } catch (err) {
          console.error('Failed to fetch recommendations', err);
        }
      } catch (error) {
        console.error('Sidebar fetch error', error);
      }
    };

    fetchOrders();
    fetchSidebarData();
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
        `${BASE_URL}/orders/${orderId}`,
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

  // Helper: consistent premium currency formatting
  const formatCurrency = (v?: number) => (typeof v === 'number' ? `रु ${v.toLocaleString('en-IN')}` : '—');

  // Refined status badge with cleaner design
  const getStatusBadge = (status: string, type: 'delivery' | 'payment') => {
    const readable = status.charAt(0) + status.slice(1).toLowerCase();
    const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium';
    const map: Record<string, { cls: string; icon: ReactNode }> = {
      COMPLETED: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      DELIVERED: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      SHIPPED: { cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: <Package2 className="h-3.5 w-3.5" /> },
      PENDING: { cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
      CANCELLED: { cls: 'bg-rose-50 text-rose-700 border border-rose-200', icon: <XCircle className="h-3.5 w-3.5" /> },
      FAILED: { cls: 'bg-red-50 text-red-700 border border-red-200', icon: <AlertCircle className="h-3.5 w-3.5" /> },
    };
    const { cls, icon } = map[status] || { cls: 'bg-gray-50 text-gray-700 border border-gray-200', icon: <AlertCircle className="h-3.5 w-3.5" /> };

    const label = type === 'delivery' ? 'Delivery' : 'Payment';

    return (
      <span className={`${base} ${cls}`} aria-label={`${type} status: ${readable}`}>
        {icon}
        <span className="capitalize">{label}: {readable}</span>
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

  // Calculate pending and delivered orders
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <NotificationProvider />
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-3 space-y-3 sm:space-y-4">
              <div className="h-32 sm:h-28 lg:h-24 rounded-xl bg-white shadow-sm animate-pulse" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-56 sm:h-52 lg:h-48 rounded-xl bg-white shadow-sm animate-pulse" />
              ))}
            </div>
            <aside className="hidden lg:block space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-white shadow-sm animate-pulse" />
              ))}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen pt-20 bg-gray-50  `}>
      <NotificationProvider />

      {/* Refined Delete Modal */}
      {deleteOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteOrderId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">Delete Order</h3>
            <p className="text-gray-600 mb-6 text-center text-sm">
              This action cannot be undone. Are you sure you want to delete this order?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOrderId(null)}
                className="flex-1 px-4 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteOrderId)}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Responsive Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-lg sm:shadow-xl">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                      <History className="h-6 w-6 sm:h-7 lg:h-8 text-blue-500" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight mb-1">Your Orders</h1>
                      <p className="text-gray-600 text-sm sm:text-base hidden sm:block">Track and manage your purchases seamlessly</p>
                    </div>
                  </div>
                </div>

                {/* Responsive Statistics Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-5 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <Package2 className="h-3 w-3 sm:h-4 sm:w-4 text-black/80" />
                      <p className="text-[10px] sm:text-xs font-medium text-black/80 uppercase tracking-wide">Total</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-black">{pageInfo.totalElements}</p>
                  </div>
                  
                  <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-5 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                      <p className="text-[10px] sm:text-xs font-medium text-black/80 uppercase tracking-wide">Pending</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{pendingOrders}</p>
                  </div>

                  <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-5 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                      <p className="text-[10px] sm:text-xs font-medium text-black/80 uppercase tracking-wide">Delivered</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">{deliveredOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Layout: main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            {/* Clean empty state */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package2 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
                  Start shopping and discover amazing products
                </p>
                <Link
                  href="/customer/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors text-sm sm:text-base"
                >
                  Browse Products
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sortedGroups.map(([status, statusOrders]) => (
                  <div key={status} className="space-y-3">
                    {statusOrders.map((order) => (
                      <div
                        key={order.id}
                        className="group relative rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300"
                      >
                        {/* Decorative gradient accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative p-4 sm:p-5 lg:p-6">
                          {/* Responsive Header Section */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                  Order #P-{order.id}
                                </h3>
                              </div>
                              
                              {/* Status Badges */}
                              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                                {getStatusBadge(order.status, 'delivery')}
                                {getStatusBadge(order.paymentStatus, 'payment')}
                              </div>
                              
                              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span>User ID: CUST-{order.userId.toString().padStart(3, '0')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:self-start">
                              <Link
                                href={`/customer/orders/${order.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm text-center"
                              >
                                View Details
                              </Link>
                              {order.paymentStatus !== 'COMPLETED' && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteOrderId(order.id);
                                  }}
                                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete order"
                                  aria-label={`Delete order ${order.id}`}
                                >
                                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-[10px] sm:text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wide">Shipping to:</p>
                            <p className="text-xs sm:text-sm text-blue-800 line-clamp-1">
                              {order.shippingAddress}
                            </p>
                          </div>

                          {/* Product Images - Responsive */}
                          <div className="mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 overflow-x-auto pb-2">
                              {order.items.slice(0, 4).map((item, idx) => (
                                <div
                                  key={item.productId}
                                  className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg sm:rounded-xl bg-gray-100 overflow-hidden ring-2 ring-gray-200 hover:ring-indigo-400 transition-all shadow-sm"
                                >
                                  <Image
                                    src={item.product?.imageUrl || '/product-placeholder.png'}
                                    alt={item.product?.name || 'Product'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
                                  <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                                    +{order.items.length - 4} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Responsive Bottom Info Section */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-5 border-t-2 border-gray-100">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                                Items
                              </p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                                Subtotal
                              </p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">
                                {formatCurrency(order.totalAmount - order.shippingCost)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                                Shipping
                              </p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">
                                {formatCurrency(order.shippingCost)}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                                Total
                              </p>
                              <p className="text-base sm:text-lg font-bold text-indigo-600">
                                {formatCurrency(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Responsive Sidebar - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block space-y-4 lg:sticky lg:top-24 self-start">
            {/* Recommended Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <h3 className="text-sm sm:text-base font-bold text-white">For You</h3>
                </div>
                <p className="text-white/90 text-[10px] sm:text-xs">Personalized picks</p>
              </div>
              <div className="divide-y divide-gray-100">
                {recommendedProducts.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/customer/products/${p.id}`}
                    className="group flex gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm sm:text-base font-bold text-indigo-600 mb-1">
                        {formatCurrency(p.price)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {p.recommendationType === 'COLLABORATIVE' ? '👥 Popular' : '✨ Similar'}
                      </p>
                    </div>
                  </Link>
                ))}
                {recommendedProducts.length === 0 && (
                  <p className="text-xs text-gray-500 p-4 text-center">No recommendations yet</p>
                )}
              </div>
            </div>

            {/* Popular Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Trending</h3>
                </div>
                <p className="text-white/90 text-[10px] sm:text-xs">Popular right now</p>
              </div>
              <div className="divide-y divide-gray-100">
                {popularProducts.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/customer/products/${p.id}`}
                    className="group flex gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm sm:text-base font-bold text-orange-600">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
                {popularProducts.length === 0 && (
                  <p className="text-xs text-gray-500 p-4 text-center">No trending products</p>
                )}
              </div>
            </div>

            {/* New Arrivals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <h3 className="text-sm sm:text-base font-bold text-white">New</h3>
                </div>
                <p className="text-white/90 text-[10px] sm:text-xs">Fresh arrivals</p>
              </div>
              <div className="divide-y divide-gray-100">
                {newProducts.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/customer/products/${p.id}`}
                    className="group flex gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm sm:text-base font-bold text-teal-600">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
                {newProducts.length === 0 && (
                  <p className="text-xs text-gray-500 p-4 text-center">No new products</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

