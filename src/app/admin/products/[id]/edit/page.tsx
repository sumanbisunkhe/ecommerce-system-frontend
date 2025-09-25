'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiSave, 
  FiX, 
  FiImage,
  FiPackage,
  FiTag
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { Funnel_Sans, Markazi_Text } from 'next/font/google';
import { BASE_URL } from '@/config/api';


// Fonts
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  active: boolean;
  categoryId: number;
}

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    active: true,
    categoryId: 0,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        const res = await fetch(`${BASE_URL}/categories/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product by ID
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        const res = await fetch(`${BASE_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const product = data.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            stockQuantity: product.stockQuantity || 0,
            active: product.active !== undefined ? product.active : true,
            categoryId: product.categoryId || 0,
          });
          if (product.imageUrl) setImagePreview(product.imageUrl);
        } else {
          notify.error(data.message || 'Failed to fetch product');
        }
      } catch (err) {
        console.error(err);
        notify.error('Failed to fetch product');
      }
    };
    fetchProduct();
  }, [productId]);

  // Handle form inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const toggleActive = () =>
    setFormData((prev) => ({
      ...prev,
      active: !prev.active,
    }));

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setIsSubmitting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const formDataToSend = new FormData();
      formDataToSend.append('product', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      if (selectedImage) formDataToSend.append('image', selectedImage);

      const res = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify.success('Product updated successfully');
        router.push('/admin/products');
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-gray-50 px-3 py-3 mt-5 rounded-lg ${funnelSans.className}`}>
      <NotificationProvider />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/products"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </Link>
            <h1 className={`${markaziText.className} text-2xl font-semibold text-gray-900`}>
              Update Product
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/products"
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto p-5">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Product Information</h2>
            </div>
            <div className="p-5 space-y-3 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain" // change to object-contain to fit the whole image
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FiImage className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>


              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                रु Price *
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiPackage className="w-4 h-4 mr-1" /> Stock *
              </label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiTag className="w-4 h-4 mr-1" /> Category *
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <button
                type="button"
                onClick={toggleActive}
                className={`relative inline-flex h-11 w-full items-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${formData.active
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                  }`}
              >
                <div className="flex items-center justify-center w-full space-x-2">
                  {formData.active ? (
                    <>
                      <FiSave className="h-4 w-4" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <FiX className="h-4 w-4" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
