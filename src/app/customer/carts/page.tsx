/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Funnel_Sans } from "next/font/google";
import { ShoppingCart, Loader2, Package2, X, Trash2, ArrowRight, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

/**
 * Helpers
 */
const getCookie = (name: string): string | undefined =>
  document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];

const getAuth = () => {
  const userCookie = getCookie('user');
  const token = getCookie('token');
  if (!userCookie || !token) throw new Error('User not found');
  const userData = JSON.parse(decodeURIComponent(userCookie));
  return { userData, userId: userData.id as number, token };
};

const formatCurrency = (value?: number) => `रु${(value ?? 0).toLocaleString('en-IN')}`;

/**
 * UI Components
 */
type CartItemWithProduct = CartItem & { product?: Product };

const CartItemCard = memo(function CartItemCard({
  item,
  index,
  onRemove,
  isDeleting,
}: {
  item: CartItemWithProduct;
  index: number;
  onRemove: (id: number) => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 border border-gray-200 group opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-all">
          <Image
            src={item.product?.imageUrl || '/product-placeholder.png'}
            alt={item.product?.name || 'Product'}
            fill
            className="object-contain p-2"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.product?.name || 'Product Name Unavailable'}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Price:</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatCurrency(item.product?.price)}
              </span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Qty:</span>
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1">
                <span className="text-sm font-medium text-blue-700">{item.quantity}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Truck className="h-3.5 w-3.5 text-green-600" />
            <span>Free delivery</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600">
              {formatCurrency(item.totalPrice)}
            </p>
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Remove item"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

const OrderSummary = memo(function OrderSummary({
  cart,
  isCheckoutOpen,
  setIsCheckoutOpen,
  shippingAddress,
  setShippingAddress,
  onPlaceOrder,
}: {
  cart: Cart;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  shippingAddress: string;
  setShippingAddress: (v: string) => void;
  onPlaceOrder: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-24">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
        <h2 className="text-base sm:text-lg font-bold text-white">Order Summary</h2>
      </div>

      {/* Summary Details */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(cart.totalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">
                {formatCurrency(cart.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Section */}
        <div className="pt-2">
          {!isCheckoutOpen ? (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 sm:py-3.5 px-4 sm:px-6 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          ) : (
            <div className="space-y-4">
              <form onSubmit={onPlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Shipping Address
                  </label>
                  <textarea
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-lg sm:rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    placeholder="Enter your complete delivery address..."
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Place Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
            <span>Free delivery on all orders</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isDeletingItem, setIsDeletingItem] = useState<number | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { userId, token } = getAuth();
        const response = await fetch(`${BASE_URL}/carts/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch cart');

        const data = await response.json();
        if (data.success) {
          // Fetch product details for each cart item
          const cartWithProducts: Cart = {
            ...data.data,
            items: await Promise.all(
              data.data.items.map(async (item: CartItem) => {
                try {
                  const productResponse = await fetch(`${BASE_URL}/products/${item.productId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/json',
                    },
                  });
                  if (!productResponse.ok) throw new Error('Failed to fetch product');
                  const productData = await productResponse.json();
                  return { ...item, product: productData.data };
                } catch (err) {
                  console.error(`Failed to fetch product ${item.productId}:`, err);
                  return item;
                }
              })
            ),
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

  const handlePlaceOrder = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!shippingAddress.trim()) throw new Error('Shipping address is required');
      const { userData, token } = getAuth();

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          shippingAddress: shippingAddress.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        notify.success('Order placed successfully!');
        router.push(`/customer/orders/${data.data.id}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      notify.error(error.message);
    }
  }, [router, shippingAddress]);

  const removeFromCart = useCallback(async (productId: number) => {
    try {
      setIsDeletingItem(productId);
      const { userId, token } = getAuth();

      const response = await fetch(`${BASE_URL}/carts/${userId}/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to remove item');

      const data = await response.json();
      if (data.success) {
        notify.success('Item removed from cart');
        setCart(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.productId !== productId),
          totalItems: Math.max(0, prev.totalItems - 1),
          totalPrice: Math.max(0, prev.totalPrice - (prev.items.find(i => i.productId === productId)?.totalPrice || 0)),
        } : null);
      }
    } catch (error: any) {
      notify.error(error.message);
    } finally {
      setIsDeletingItem(null);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setIsClearingCart(true);
      const { userId, token } = getAuth();

      const response = await fetch(`${BASE_URL}/carts/${userId}/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

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
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 text-center max-w-lg w-full">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package2 className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Your cart is empty</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 leading-relaxed">Discover our curated collection of premium products and start shopping today.</p>
          <button
            onClick={() => router.push('/customer/products')}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-600/20"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} min-h-screen bg-gray-50`}>
      <NotificationProvider />
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 mt-12 sm:mt-16">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                    {cart.totalItems}
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
              {cart && cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  disabled={isClearingCart}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-100 flex-shrink-0"
                >
                  {isClearingCart ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">Clear Cart</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl transition-all duration-300 mt-4 sm:mt-6 lg:mt-8 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              {cart.items.map((item, index) => (
                <CartItemCard
                  key={item.productId}
                  item={item}
                  index={index}
                  onRemove={removeFromCart}
                  isDeleting={isDeletingItem === item.productId}
                />
              ))}
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-4 space-y-4">
              <OrderSummary
                cart={cart}
                isCheckoutOpen={isCheckoutOpen}
                setIsCheckoutOpen={setIsCheckoutOpen}
                shippingAddress={shippingAddress}
                setShippingAddress={setShippingAddress}
                onPlaceOrder={handlePlaceOrder}
              />
              {/* Additional Info Card */}
              <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-100">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">Need Help?</h3>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  Our customer support team is available 24/7 to assist you with your order.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
