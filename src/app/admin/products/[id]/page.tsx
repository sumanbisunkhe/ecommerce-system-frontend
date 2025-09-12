'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, SquarePen } from 'lucide-react';
import { Funnel_Sans, Markazi_Text } from 'next/font/google';

// Fonts
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  active: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductViewPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

        if (!response.ok) throw new Error('Failed to fetch product details');
        const data = await response.json();

        if (data.success) setProduct(data.data);
        else throw new Error(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-400 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 px-3 py-3 mt-5 rounded-lg ${funnelSans.className}`}>
      {/* Header */}
      <div className="bg-white py-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/products"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className={`${markaziText.className} text-2xl font-semibold text-gray-900`}>
              Product Details
            </h1>
          </div>

          <Link
            href={`/admin/products/${product.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <SquarePen className="h-4 w-4" />
            <span>Edit Product</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Product Image */}
            <div className="relative w-full aspect-square rounded-lg border border-gray-200 overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className={`${markaziText.className} text-3xl font-bold text-gray-900 mb-2`}>
                  {product.name}
                </h2>
                <p className="text-gray-500">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    रु {product.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {product.stockQuantity} units
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className={`mt-1 text-lg font-semibold ${product.active ? 'text-green-600' : 'text-red-600'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}