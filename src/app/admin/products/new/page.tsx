'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, DollarSign, Package, Tag, Check, X, ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';


// Google Fonts
import { Funnel_Sans, Markazi_Text } from 'next/font/google';
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });
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
    categoryId: number | null;
}

export default function NewProductPage() {
    const router = useRouter();
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
        categoryId: null,
    });


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                const response = await fetch(`${BASE_URL}/categories/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const formDataToSend = new FormData();
            formDataToSend.append('product', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
            if (selectedImage) formDataToSend.append('image', selectedImage);

            const response = await fetch(`${BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify.success('Product created successfully');
                router.push('/admin/products');
            } else {
                throw new Error(data.message || 'Failed to create product');
            }
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || name === 'categoryId' ? (value === '' ? null : Number(value)) : value
        }));
    };

    return (
        <div className={`bg-gray-50 px-3 py-3 mt-5 rounded-lg ${funnelSans.className}`}>
            <NotificationProvider />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/admin/products"
                                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <h1 className={`${markaziText.className} text-2xl font-semibold text-gray-900`}>
                                New Product
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
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Create Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-5">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Product Information</h2>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Image Upload */}
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Image
                                    </label>
                                    <div className="relative">
                                        {imagePreview ? (
                                            <div className="relative w-full h-44 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain" // use object-contain to fit the whole image
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-medium">Click to upload</span>
                                                </p>
                                                <p className="text-xs text-gray-400">PNG, JPG or GIF (MAX. 10MB)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>


                                {/* Form Fields */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Name <span className="text-red-500">*</span>
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

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
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
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Pricing & Inventory</h2>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Price */}
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                                        Price <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">रु</span>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Package className="w-4 h-4 mr-1 text-gray-500" />
                                        Stock <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="stockQuantity"
                                        name="stockQuantity"
                                        required
                                        min="0"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Quantity"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Tag className="w-4 h-4 mr-1 text-gray-500" />
                                        Category <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        required
                                        value={formData.categoryId ?? ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                        className={`relative inline-flex h-11 w-full items-center rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${formData.active
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center w-full space-x-2">
                                            {formData.active ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    <span className="font-medium">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4" />
                                                    <span className="font-medium">Inactive</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
