/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Funnel_Sans } from "next/font/google";
import { ShoppingCart, Loader2, Package2, X, Trash2 } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import Footer from '@/components/ui/Footer';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  productId: number;
  quantity: number;
  totalPrice: number;
  product?: Product;
}

interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface OrderResponse {
  id: number;
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: string;
  shippingCost: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState<number | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (!userCookie) {
          throw new Error('User not found');
        }

        const userData = JSON.parse(decodeURIComponent(userCookie));
        const userId = userData.id;
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        const response = await fetch(
          `${BASE_URL}/carts/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        if (data.success) {
          // Fetch product details for each cart item
          const cartWithProducts = {
            ...data.data,
            items: await Promise.all(
              data.data.items.map(async (item: CartItem) => {
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
                    product: productData.data
                  };
                } catch (error) {
                  console.error(`Failed to fetch product ${item.productId}:`, error);
                  return item;
                }
              })
            )
          };

          setCart(cartWithProducts);
        } else {
          throw new Error(data.message);
        }
      } catch (error: any) {
        notify.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleCheckout = async (shippingAddress: string) => {
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1];

      if (!userCookie) {
        throw new Error('User not found');
      }

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: userData.id,
          shippingAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Order placed successfully!');
        setIsCheckoutModalOpen(false);
        router.push('/customer/orders');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      notify.error(error.message);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1];

      if (!userCookie) throw new Error('User not found');
      if (!shippingAddress.trim()) throw new Error('Shipping address is required');

      const userData = JSON.parse(decodeURIComponent(userCookie));
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userData.id,
          shippingAddress: shippingAddress.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        notify.success('Order placed successfully!');
        // Redirect to the order details page
        router.push(`/customer/orders/${data.data.id}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      notify.error(error.message);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setIsDeletingItem(productId);
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
        `${BASE_URL}/carts/${userId}/remove/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to remove item');

      const data = await response.json();
      if (data.success) {
        notify.success('Item removed from cart');
        // Update cart state by removing the item
        setCart(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.productId !== productId),
          totalItems: prev.totalItems - 1,
          totalPrice: prev.totalPrice - (prev.items.find(item => item.productId === productId)?.totalPrice || 0)
        } : null);
      }
    } catch (error: any) {
      notify.error(error.message);
    } finally {
      setIsDeletingItem(null);
    }
  };

  const clearCart = async () => {
    try {
      setIsClearingCart(true);
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
        `${BASE_URL}/carts/${userId}/clear`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to clear cart');

      const data = await response.json();
      if (data.success) {
        notify.success('Cart cleared successfully');
        setCart(null);
      }
    } catch (error: any) {
      notify.error(error.message);
    } finally {
      setIsClearingCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package2 className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500">Start shopping to add items to your cart.</p>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} container mx-auto px-4 py-8 pt-24`}>
      <NotificationProvider />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Your Cart</h1>
            </div>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                disabled={isClearingCart}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                {isClearingCart ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear Cart
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div key={item.productId} className="p-6 flex items-center gap-6">
              {/* Product Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.product?.imageUrl || '/product-placeholder.png'}
                  alt={item.product?.name || 'Product'}
                  fill
                  className="object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.product?.name || 'Product Name Unavailable'}
                </h3>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                  <p>Unit Price: रु{item.product?.price.toLocaleString('en-IN') || '0'}</p>
                  <span className="hidden sm:inline">•</span>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>

              {/* Total Price and Remove Button */}
              <div className="flex-shrink-0 flex items-center gap-4">
                <p className="font-semibold text-blue-600">
                  रु{item.totalPrice.toLocaleString('en-IN')}
                </p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  disabled={isDeletingItem === item.productId}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  {isDeletingItem === item.productId ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-start">
            {/* Cart Summary - Left Side */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold text-gray-900">{cart.totalItems}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Total Price:</span>
                <span className="text-lg font-semibold text-blue-600">
                  रु{cart.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Section - Right Side */}
            <div className="w-80">
              {!isCheckoutOpen ? (
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <textarea
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your shipping address"
                      />
                    </div>

                    {orderDetails && (
                      <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium">रु{orderDetails.shippingCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-blue-600">रु{orderDetails.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Place Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
