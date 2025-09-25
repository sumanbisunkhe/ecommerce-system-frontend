/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Funnel_Sans } from "next/font/google";
import { Package2, History, Clock, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
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

  // Premium badge with icon + readable label
  const getStatusBadge = (status: string, type: 'delivery' | 'payment') => {
    const readable = status.charAt(0) + status.slice(1).toLowerCase();
    const base =
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset';
    const map: Record<
      string,
      { cls: string; icon: ReactNode }
    > = {
      COMPLETED: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      DELIVERED: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
      SHIPPED: { cls: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: <Package2 className="h-3.5 w-3.5" /> },
      PENDING: { cls: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: <Clock className="h-3.5 w-3.5" /> },
      CANCELLED: { cls: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: <XCircle className="h-3.5 w-3.5" /> },
      FAILED: { cls: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: <AlertCircle className="h-3.5 w-3.5" /> },
    };
    const { cls, icon } = map[status] || { cls: 'bg-gray-50 text-gray-700 ring-gray-600/20', icon: <AlertCircle className="h-3.5 w-3.5" /> };

    return (
      <span className={`${base} ${cls}`} aria-label={`${type} status: ${readable}`}>
        {icon}
        <span className="hidden sm:inline">{type === 'delivery' ? 'Delivery' : 'Payment'}:</span>
        <span className="capitalize">{readable.toLowerCase()}</span>
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
    // Premium skeleton loader for main and sidebar
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <NotificationProvider />
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-14 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm" />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl border border-gray-100 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm animate-pulse"
                />
              ))}
            </div>
            <aside className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl border border-gray-100 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm animate-pulse"
                />
              ))}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-slate-100`}>
      <NotificationProvider />

      {deleteOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Delete order?</h3>
            <p className="text-sm text-gray-600 mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteOrderId(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteOrderId)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium layout: glass card + sticky sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-2xl shadow-lg border border-white/60 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/70 to-cyan-50/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow ring-1 ring-gray-100">
                      <History className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Order History</h1>
                      <p className="text-xs text-gray-500">Track, manage, and revisit your purchases</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-white/70 ring-1 ring-gray-200 px-3 py-1 rounded-full">
                    {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>

              {/* Empty state */}
              {orders.length === 0 ? (
                <div className="p-14 text-center bg-white/40">
                  <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-gray-200 flex items-center justify-center">
                    <Package2 className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">When you place orders, they'll appear here.</p>
                  <Link
                    href="/customer/products"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {sortedGroups.map(([status, statusOrders]) => (
                    <div key={status} className="space-y-4">
                      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 px-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_0_3px] shadow-blue-100"></span>
                        {status.charAt(0) + status.slice(1).toLowerCase()} Orders
                        <span className="text-sm font-normal text-gray-500">({statusOrders.length})</span>
                      </h2>

                      <div className="grid gap-4">
                        {statusOrders.map((order) => (
                          <div
                            key={order.id}
                            className="group relative rounded-xl border border-gray-200/80 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <Link href={`/customer/orders/${order.id}`} className="flex-1">
                                  <div className="space-y-4">
                                    {/* Top row */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md text-sm font-medium ring-1 ring-slate-200">
                                        #{order.id}
                                      </span>
                                      {getStatusBadge(order.status, 'delivery')}
                                      {getStatusBadge(order.paymentStatus, 'payment')}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-1">
                                      {/* Items preview */}
                                      <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                          {order.items.slice(0, 3).map((item) => (
                                            <div
                                              key={item.productId}
                                              className="relative w-10 h-10 rounded-lg ring-2 ring-white bg-white shadow-sm"
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
                                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-white flex items-center justify-center text-xs font-medium text-blue-700">
                                              +{order.items.length - 3}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                        </span>
                                      </div>

                                      {/* Address + Price */}
                                      <div className="flex items-center justify-between flex-1 gap-4">
                                        <div className="text-sm text-gray-600 truncate">
                                          <span className="inline-block px-2 py-1 bg-gray-50 rounded-md ring-1 ring-gray-100 truncate max-w-[340px]">
                                            📍 {order.shippingAddress}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-bold text-blue-600 tracking-tight">
                                            {formatCurrency(order.totalAmount)}
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Incl. {formatCurrency(order.shippingCost)} shipping
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
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                    title="Delete order"
                                    aria-label={`Delete order ${order.id}`}
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

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3 tracking-tight">Recommended for you</h3>
              <div className="divide-y divide-gray-100/80">
                {recommendedProducts.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/customer/products/${p.id}`} className="block hover:bg-gray-50/70 rounded-lg">
                    <div className="flex gap-3 py-3 px-2">
                      <div className="relative w-14 h-14 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                        <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{p.name}</h4>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</p>
                        <p className="text-xs text-gray-500">
                          {p.recommendationType === 'COLLABORATIVE' ? 'Based on similar users' : 'Similar product'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {recommendedProducts.length === 0 && <p className="text-sm text-gray-500 p-2">No recommendations yet.</p>}
              </div>
            </div>

            <div className="bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3 tracking-tight">Popular products</h3>
              <div className="divide-y divide-gray-100/80">
                {popularProducts.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/customer/products/${p.id}`} className="block hover:bg-gray-50/70 rounded-lg">
                    <div className="flex gap-3 py-3 px-2">
                      <div className="relative w-14 h-14 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                        <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{p.name}</h4>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {popularProducts.length === 0 && <p className="text-sm text-gray-500 p-2">No popular products found.</p>}
              </div>
            </div>

            <div className="bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3 tracking-tight">New arrivals</h3>
              <div className="divide-y divide-gray-100/80">
                {newProducts.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/customer/products/${p.id}`} className="block hover:bg-gray-50/70 rounded-lg">
                    <div className="flex gap-3 py-3 px-2">
                      <div className="relative w-14 h-14 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                        <Image src={p.imageUrl || '/product-placeholder.png'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{p.name}</h4>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(p.price)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {newProducts.length === 0 && <p className="text-sm text-gray-500 p-2">No new products found.</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

