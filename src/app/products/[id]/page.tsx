/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Loader2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';
import { Funnel_Sans, Markazi_Text } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Header from '@/app/header';
import Footer from '@/components/ui/Footer';
import { BASE_URL } from '@/config/api';



// Fonts
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
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
                const response = await fetch(`${BASE_URL}/products/${params.id}`);

                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();

                if (data.success) {
                    setProduct(data.data);
                    // Fetch category details
                    const categoryResponse = await fetch(
                        `${BASE_URL}/categories/${data.data.categoryId}`
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

        // Updated recommendation fetch function
        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch(`${BASE_URL}/products/${params.id}/related?limit=5`);
                if (!response.ok) throw new Error('Failed to fetch related products');

                const data = await response.json();
                if (data.success) {
                    setRelatedProducts(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch related products:', error);
                setRelatedProducts([]);
            }
        };

        if (params.id) {
            fetchProduct();
            fetchRelatedProducts();
        }
    }, [params.id]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newValue = prev + delta;
            return Math.max(1, Math.min(newValue, product?.stockQuantity || 1));
        });
    };

    const addToCart = () => {
        router.push('/auth/login');
    };

    return (
        <div className={`${funnelSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col pt-8 sm:pt-10 md:pt-12`}>
            <Header />
            <NotificationProvider />
            
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] pt-12 sm:pt-14 md:pt-16">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium text-sm sm:text-base">Loading product details...</p>
                    </div>
                </div>
            ) : !product ? (
                <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] pt-12 sm:pt-14 md:pt-16 px-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ChevronLeft className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Product not found</h3>
                        <p className="text-slate-600 mb-6 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Products
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pt-12 sm:pt-14 md:pt-16">
                    {/* Breadcrumb */}
                    <div className="mb-4 sm:mb-6 flex items-center text-slate-700">
                        <Link
                            href="/products"
                            className="flex items-center hover:text-indigo-600 transition-colors group"
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm sm:text-base font-medium">Back</span>
                        </Link>
                        <span className="mx-2 text-slate-400">/</span>
                        <span className="text-sm sm:text-base font-semibold text-slate-900">Product Details</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                        {/* Main Product Details */}
                        <div className="lg:col-span-3 xl:col-span-4">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden">
                                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-12 p-4 sm:p-6 md:p-8 lg:p-10">
                                    {/* Product Image */}
                                    <div className="w-full lg:w-[50%] xl:w-[52%]">
                                        <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                                            <Image
                                                src={product.imageUrl || '/product-placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-3 sm:p-4 md:p-5 lg:p-6"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                                priority
                                            />
                                            {/* Premium badge if high price */}
                                            {product.price > 50000 && (
                                                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-xs font-bold shadow-lg">
                                                    Premium
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="w-full lg:w-[50%] xl:w-[48%] space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                                        {/* Title & Description */}
                                        <div>
                                            <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 sm:mb-2 md:mb-3 leading-tight">
                                                {product.name}
                                            </h1>
                                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                            {/* Price */}
                                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border border-indigo-100/50">
                                                <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-1.5">Price</h3>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                    रु {product.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>

                                            {/* Availability */}
                                            <div className={`bg-gradient-to-br ${product.stockQuantity > 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50'} p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border ${product.stockQuantity > 0 ? 'border-green-100/50' : 'border-red-100/50'}`}>
                                                <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-1.5">Availability</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                                    <p className={`text-sm sm:text-base font-bold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Category */}
                                            {category && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border border-blue-100/50 sm:col-span-2">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-1.5">Category</h3>
                                                    <Link
                                                        href={`/products?category=${category.id}`}
                                                        className="group inline-flex items-center gap-1.5 mb-1 sm:mb-1.5"
                                                    >
                                                        <span className="text-base sm:text-lg font-bold text-indigo-600 group-hover:text-indigo-700">
                                                            {category.name}
                                                        </span>
                                                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                                                        {category.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity and Add to Cart */}
                                        <div className="border-t border-slate-200 pt-4 sm:pt-5 space-y-3">
                                            <div className="flex items-end gap-3 sm:gap-4">
                                                {/* Quantity Selector */}
                                                <div className="flex-shrink-0">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-2">Quantity</h3>
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <button
                                                            onClick={() => handleQuantityChange(-1)}
                                                            disabled={quantity <= 1}
                                                            className="p-2 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all"
                                                        >
                                                            <Minus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                        <span className="w-12 text-center font-bold text-base sm:text-lg text-slate-900">{quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(1)}
                                                            disabled={quantity >= product.stockQuantity}
                                                            className="p-2 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all"
                                                        >
                                                            <Plus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={addToCart}
                                                    disabled={product.stockQuantity === 0}
                                                    className="h-[50px] w-[60px] sm:flex-1 sm:h-[50px] sm:w-auto px-3 sm:px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base
                                                        hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed
                                                        flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 disabled:transform-none
                                                        ml-auto sm:ml-0"
                                                >
                                                    <ShoppingCart className="h-5 w-5" />
                                                    <span className="hidden sm:inline">Add to Cart</span>
                                                </button>
                                            </div>

                                            {/* Total Price Preview */}
                                            {quantity > 1 && (
                                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-slate-600">Total ({quantity} items):</span>
                                                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                        <div className="lg:col-span-1 xl:col-span-1">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/50 shadow-lg p-4 sm:p-6 lg:sticky lg:top-20">
                                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                                    <span className="text-xl sm:text-2xl">✨</span>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                        Related Products
                                    </h3>
                                </div>
                                <div className="space-y-1">
                                    {relatedProducts.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <ChevronRight className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <p className="text-sm text-slate-500">No related products found</p>
                                        </div>
                                    ) : (
                                        relatedProducts.map((relatedProduct) => (
                                            <Link
                                                key={relatedProduct.id}
                                                href={`/products/${relatedProduct.id}`}
                                                className="block hover:bg-slate-50 transition-all duration-300 rounded-xl group"
                                            >
                                                <div className="flex gap-3 py-3 px-2">
                                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100">
                                                        <Image
                                                            src={relatedProduct.imageUrl || '/product-placeholder.png'}
                                                            alt={relatedProduct.name}
                                                            fill
                                                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                                                            {relatedProduct.name}
                                                        </h4>
                                                        <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
            
            <div className="mt-8 sm:mt-12 lg:mt-16">
                <Footer />
            </div>
        </div>
    );
}