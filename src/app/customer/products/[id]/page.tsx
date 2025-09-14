'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Funnel_Sans, Markazi_Text } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';

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

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('token='))
                    ?.split('=')[1];

                const response = await fetch(`http://localhost:8080/products/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();

                if (data.success) {
                    setProduct(data.data);
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

                const response = await fetch(`http://localhost:8080/recommendations/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch recommendations');
                const data = await response.json();

                if (data.success) {
                    // Fetch product details for each recommendation
                    const productDetailsPromises = data.data.map(async (rec: Recommendation) => {
                        const productResponse = await fetch(`http://localhost:8080/products/${rec.productId}`, {
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
                    setRecommendedProducts(recommendedProductsDetails);
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
        if (!product) return;

        try {
            setIsAddingToCart(true);
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
                `http://localhost:8080/carts/${userId}/add/${product.id}?quantity=${quantity}`,
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
                notify.success('Added to cart successfully');
                router.push('/customer/carts');
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            notify.error(error.message);
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Product not found</p>
                    <Link
                        href="/customer/products"
                        className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`${funnelSans.className} min-h-screen bg-gray-50 flex flex-col pt-16`}>
            <NotificationProvider />
            <div className="flex-1 container mx-auto px-4 sm:px-6 py-6">
                <div className="mb-4 flex items-center text-gray-700">
                    <Link
                        href="/customer/products"
                        className="flex items-center hover:text-blue-600 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                    </Link>
                    <span className={`${markaziText.className} text-2xl font-semibold text-gray-900`}>Product Details</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Product Details */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex flex-col lg:flex-row gap-16 p-14 md:p-16">
                                {/* Product Image */}
                                <div className="w-full lg:w-[55%]">
                                    <div className="relative w-full aspect-square rounded-md border border-gray-200 overflow-hidden bg-gray-50">
                                        <Image
                                            src={product.imageUrl || '/product-placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-3"
                                            sizes="(max-width: 1024px) 100vw, 40vw"
                                        />
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="w-full lg:w-3/5 space-y-12">
                                    <div>
                                        <h2 className={`${markaziText.className} text-xl md:text-2xl font-bold text-gray-900 mb-2`}>
                                            {product.name}
                                        </h2>
                                        <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-3">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <h3 className="text-xs font-medium text-gray-500 mb-1">Price</h3>
                                            <p className="text-lg md:text-xl font-semibold text-blue-600">
                                                रु {product.price.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <h3 className="text-xs font-medium text-gray-500 mb-1">Availability</h3>
                                            <p className={`text-sm md:text-base font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity and Add to Cart */}
                                    <div className="border-t border-gray-200 pt-4 space-y-4">
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-500 mb-2">Quantity</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    disabled={quantity <= 1}
                                                    className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-10 text-center font-medium text-base">{quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    disabled={quantity >= product.stockQuantity}
                                                    className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addToCart}
                                            disabled={isAddingToCart || product.stockQuantity === 0}
                                            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-md font-medium
                                                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                                                flex items-center justify-center gap-1.5 transition-colors text-sm"
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <h3 className={`${markaziText.className} text-lg font-semibold mb-4`}>
                                Recommended for you
                            </h3>
                            <div className="divide-y divide-gray-100">
                                {recommendedProducts.slice(0, 5).map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/customer/products/${product.id}`}
                                        className="block hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex gap-3 py-4 px-2">
                                            <div className="relative w-16 h-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={product.imageUrl || '/product-placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="68px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </h4>
                                                <p className="text-sm font-medium text-blue-600">
                                                    रु {product.price.toLocaleString('en-IN')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {product.recommendationType === 'COLLABORATIVE'
                                                        ? 'Based on similar users'
                                                        : 'Similar product'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}