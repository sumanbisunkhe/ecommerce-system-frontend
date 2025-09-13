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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} container mx-auto px-20 py-8 pt-24`}>
      <NotificationProvider />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Package2 className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Your Orders</h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500">Start shopping to place your first order.</p>
          </div>
        ) : (
          <div className="grid gap-6 p-6">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/customer/orders/${order.id}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">
                          {order.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold text-blue-600">
                        रु{order.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Preview of Items */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-4">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.productId} className="relative w-12 h-12 rounded-full border-2 border-white">
                          <Image
                            src={item.product?.imageUrl || '/product-placeholder.png'}
                            alt={item.product?.name || 'Product'}
                            fill
                            className="object-contain rounded-full bg-gray-50 p-1"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="relative w-12 h-12 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-sm text-gray-600 font-medium">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <p>Shipping to: {order.shippingAddress}</p>
                    <p>Shipping: रु{order.shippingCost.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
