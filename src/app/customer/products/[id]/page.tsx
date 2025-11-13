/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Loader2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';

const funnelSans = Funnel_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    active: boolean;
    imageUrl: string;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
}

interface Recommendation {
    id: number;
    productId: number;
    productName: string;
    type: 'COLLABORATIVE' | 'CONTENT_BASED';
    userId: number;
    score: number;
}

// Add this interface after the existing interfaces
interface RecommendedProduct extends Product {
    recommendationType: 'COLLABORATIVE' | 'CONTENT_BASED';
    recommendationScore: number;
}

interface Category {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];

                const response = await fetch(`${BASE_URL}/products/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();

                if (data.success) {
                    setProduct(data.data);
                    // Fetch category details
                    const categoryResponse = await fetch(
                        `${BASE_URL}/categories/${data.data.categoryId}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    
                    if (categoryResponse.ok) {
                        const categoryData = await categoryResponse.json();
                        if (categoryData.success) {
                            setCategory(categoryData.data);
                        }
                    }
                } else {
                    throw new Error(data.message);
                }
            } catch (error: any) {
                notify.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch recommendations
        const fetchRecommendations = async () => {
            try {
                const userCookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('user='))
                    ?.split('=')[1];

                if (!userCookie) return;

                const userData = JSON.parse(decodeURIComponent(userCookie));
                const userId = userData.id;
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('token='))
                    ?.split('=')[1];

                const response = await fetch(`${BASE_URL}/recommendations/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch recommendations');
                const data = await response.json();

                if (data.success) {
                    // Fetch product details for each recommendation
                    const productDetailsPromises = data.data.map(async (rec: Recommendation) => {
                        const productResponse = await fetch(`${BASE_URL}/products/${rec.productId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const productData = await productResponse.json();
                        return {
                            ...productData.data,
                            recommendationType: rec.type,
                            recommendationScore: rec.score,
                        };
                    });

                    const recommendedProductsDetails = await Promise.all(productDetailsPromises);
                    setRelatedProducts(recommendedProductsDetails);
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            }
        };

        if (params.id) {
            fetchProduct();
            fetchRecommendations();
        }
    }, [params.id]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newValue = prev + delta;
            return Math.max(1, Math.min(newValue, product?.stockQuantity || 1));
        });
    };

    const addToCart = async () => {
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
                `${BASE_URL}/carts/${userId}/add/${product?.id}?quantity=${quantity}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to add to cart');

            const data = await response.json();
            if (data.success) {
                notify.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
                setQuantity(1);
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            notify.error(error.message);
        }
    };

    return (
        <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col`}>
            <NotificationProvider />
            
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-screen px-4">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium text-xs sm:text-sm md:text-base">Loading product details...</p>
                    </div>
                </div>
            ) : !product ? (
                <div className="flex-1 flex items-center justify-center min-h-screen px-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-indigo-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Product not found</h3>
                        <p className="text-slate-600 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">The product you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/customer/products"
                            className="inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm md:text-base"
                        >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            Back to Products
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pt-20 sm:pt-24 md:pt-28">
                    {/* Breadcrumb */}
                    <div className="mb-4 sm:mb-6 flex items-center text-slate-700">
                        <Link
                            href="/customer/products"
                            className="flex items-center hover:text-indigo-600 transition-colors group"
                        >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs sm:text-sm md:text-base font-medium">Back</span>
                        </Link>
                        <span className="mx-2 text-slate-400 text-xs sm:text-sm">/</span>
                        <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-900">Product Details</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {/* Main Product Details */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden">
                                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
                                    {/* Product Image */}
                                    <div className="w-full lg:w-1/2">
                                        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                                            <Image
                                                src={product.imageUrl || '/product-placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-4 sm:p-6 md:p-8"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                                priority
                                            />
                                            {product.price > 50000 && (
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                                                    Premium
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="w-full lg:w-1/2 space-y-4 sm:space-y-5 md:space-y-6">
                                        {/* Title & Description */}
                                        <div>
                                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
                                                {product.name}
                                            </h1>
                                            <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            {/* Price */}
                                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-indigo-100/50">
                                                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 mb-1">Price</h3>
                                                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                    रु {product.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>

                                            {/* Availability */}
                                            <div className={`bg-gradient-to-br ${product.stockQuantity > 0 ? 'from-green-50 to-emerald-50 border-green-100/50' : 'from-red-50 to-rose-50 border-red-100/50'} p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border`}>
                                                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 mb-1">Availability</h3>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                                    <p className={`text-xs sm:text-sm md:text-base font-bold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Category */}
                                            {category && (
                                                <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-blue-100/50">
                                                    <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 mb-1">Category</h3>
                                                    <Link
                                                        href={`/customer/products?category=${category.id}`}
                                                        className="group inline-flex items-center gap-1 mb-1"
                                                    >
                                                        <span className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 group-hover:text-indigo-700">
                                                            {category.name}
                                                        </span>
                                                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 line-clamp-2">
                                                        {category.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity and Add to Cart */}
                                        <div className="border-t border-slate-200 pt-3 sm:pt-4 space-y-3">
                                            <div className="flex items-end gap-2 sm:gap-3">
                                                {/* Quantity Selector */}
                                                <div className="flex-shrink-0">
                                                    <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">Quantity</h3>
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(-1)}
                                                            disabled={quantity <= 1}
                                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all"
                                                        >
                                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-slate-700" />
                                                        </button>
                                                        <span className="w-8 sm:w-10 md:w-12 text-center font-bold text-sm sm:text-base md:text-lg text-slate-900">{quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(1)}
                                                            disabled={quantity >= product.stockQuantity}
                                                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all"
                                                        >
                                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-slate-700" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={addToCart}
                                                    disabled={product.stockQuantity === 0}
                                                    className="ml-auto w-[180px] sm:w-[200px] md:w-[220px] h-[42px] sm:h-[46px] md:h-[50px] px-3 sm:px-4 md:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base
                                                        hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed
                                                        flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 disabled:transform-none"
                                                >
                                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    <span>Add to Cart</span>
                                                </button>
                                            </div>

                                            {/* Total Price Preview */}
                                            {quantity > 1 && (
                                                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs sm:text-sm text-slate-600">Total ({quantity} items):</span>
                                                        <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                            रु {(product.price * quantity).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Products Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg p-3 sm:p-4 md:p-6 lg:sticky lg:top-24">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <span className="text-lg sm:text-xl md:text-2xl">✨</span>
                                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">
                                        Related Products
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    {relatedProducts.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-slate-400" />
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-500">No related products found</p>
                                        </div>
                                    ) : (
                                        relatedProducts.map((relatedProduct) => (
                                            <Link
                                                key={relatedProduct.id}
                                                href={`/customer/products/${relatedProduct.id}`}
                                                className="block hover:bg-slate-50 transition-all duration-300 rounded-lg sm:rounded-xl group"
                                            >
                                                <div className="flex gap-2 sm:gap-3 py-2 sm:py-2.5 md:py-3 px-1.5 sm:px-2">
                                                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100">
                                                        <Image
                                                            src={relatedProduct.imageUrl || '/product-placeholder.png'}
                                                            alt={relatedProduct.name}
                                                            fill
                                                            className="object-contain p-1.5 sm:p-2 group-hover:scale-110 transition-transform duration-300"
                                                            sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-0.5 sm:mb-1">
                                                            {relatedProduct.name}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                            रु {relatedProduct.price.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}