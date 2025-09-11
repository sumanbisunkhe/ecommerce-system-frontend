'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import {
    View,
    SquarePen,
    Trash2,
    Search,
    ArrowUp,
    ArrowDown,
    Package2,
    CircleDollarSign,
    CheckCircle2,
    XCircle,
    Tag,
    CopyPlus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';

// Google Fonts
import { Funnel_Sans, Markazi_Text } from 'next/font/google';
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    active: boolean;
    categoryId: number;
    categoryName: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: number;
    name: string;
}

interface PageInfo {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        size: 5,
        number: 1,
        totalElements: 0,
        totalPages: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch category by ID
    const fetchCategoryById = useCallback(async (id: number) => {
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const response = await fetch(`http://localhost:8080/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch category');
            const data = await response.json();
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message);
        } catch (err) {
            console.error('Error fetching category:', err);
            return null;
        }
    }, []);

    // Cache for category data
    const [categoryCache, setCategoryCache] = useState<Record<number, Category>>({});

    // Fetch categories for filter
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                const response = await fetch('http://localhost:8080/categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data.content);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setSearchTerm(value);
            setPageInfo(prev => ({ ...prev, number: 1 }));
        }, 500),
        []
    );

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const categoryParam = selectedCategory !== 'all' ? `&categoryId=${selectedCategory}` : '';
            const activeParam = activeFilter !== 'all' ? `&active=${activeFilter === 'active'}` : '';

            const response = await fetch(
                `http://localhost:8080/products/all?search=${searchTerm}&page=${pageInfo.number}&size=${pageInfo.size}&sortBy=${sortBy}&ascending=${sortOrder === 'asc'}${categoryParam}${activeParam}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            if (data.success) {
                const products = data.data.content;

                // Fetch category details for products that aren't in cache
                const categoryPromises = products
                    .filter((product: Product) => !categoryCache[product.categoryId])
                    .map(async (product: Product) => {
                        const category = await fetchCategoryById(product.categoryId);
                        if (category) {
                            setCategoryCache(prev => ({
                                ...prev,
                                [product.categoryId]: category
                            }));
                        }
                        return category;
                    });


                await Promise.all(categoryPromises);

                setProducts(products);
                setPageInfo(prev => ({
                    ...prev,
                    totalElements: data.data.page.totalElements,
                    totalPages: data.data.page.totalPages,
                }));
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, pageInfo.number, pageInfo.size, sortBy, sortOrder, selectedCategory, activeFilter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Delete product handler
    const handleDeleteProduct = async (productId: number) => {
        setIsDeleting(true);
        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            const response = await fetch(`http://localhost:8080/products/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete product');
            }

            notify.success('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setIsDeleting(false);
            setDeleteProductId(null);
        }
    };

    // Skeleton loader
    const renderSkeletonRows = () =>
        Array.from({ length: pageInfo.size }).map((_, idx) => (
            <tr key={idx}>
                {Array.from({ length: 8 }).map((_, tdIdx) => (
                    <td key={tdIdx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                ))}
            </tr>
        ));

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getSortIcon = () => {
        return sortOrder === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
        ) : (
            <ArrowDown className="w-4 h-4" />
        );
    };

    return (
    <div className={` ${funnelSans.className}`}>
          
            <main className="space-y-6 px-4">
                <NotificationProvider />
                <ConfirmDialog
                    isOpen={deleteProductId !== null}
                    title="Delete Product"
                    message="Are you sure you want to delete this product? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={() => deleteProductId && handleDeleteProduct(deleteProductId)}
                    onCancel={() => setDeleteProductId(null)}
                />

                {/* Filters and Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Search */}
                            <div className="flex-1 min-w-[300px] relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products by name or description..."
                                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                    onChange={e => debouncedSearch(e.target.value)}
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="min-w-[200px]">
                                <select
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="min-w-[150px]">
                                <select
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={activeFilter}
                                    onChange={e => setActiveFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Sort Control */}
                            <div className="flex items-center min-w-[200px]">
                                <div className="relative flex-1">
                                    <select
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                    >
                                        <option value="updatedAt">Last Updated</option>
                                        <option value="createdAt">Created Date</option>
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="stockQuantity">Stock</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))}
                                    className="ml-2 p-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                                >
                                    {getSortIcon()}
                                </button>
                            </div>

                            {/* Page Size */}
                            <div className="min-w-[120px]">
                                <select
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={pageInfo.size}
                                    onChange={e => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), number: 1 }))}
                                >
                                    {[5, 10, 20, 50, 100].map(n => (
                                        <option key={n} value={n}>
                                            {n} per page
                                        </option>
                                    ))}
                                </select>
                            </div>
                          </div>

                          <Link
                            href="/admin/products/new"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition shadow-sm hover:shadow-md whitespace-nowrap"
                          >
                            <CopyPlus className="w-4 h-4" />
                            New
                          </Link>
                        </div>

                        {/* Results Summary */}
                        {!isLoading && !error && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>
                                        Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{pageInfo.totalElements}</span> products
                                    </span>
                                </div>
                                {searchTerm && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Filtered by:</span>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                                            "{searchTerm}"
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['ID', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Updated', 'Actions'].map((th, idx) => (
                                        <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {th}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    renderSkeletonRows()
                                ) : error ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="text-red-600 text-sm font-medium">{error}</div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <Package2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                <p className="text-sm font-medium">No products found</p>
                                                <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                                #{product.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <Package2 className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md font-medium">
                                                    {categoryCache[product.categoryId]?.name || 'Loading...'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm font-medium text-gray-900">
                                                    <CircleDollarSign className="h-4 w-4 text-gray-400 mr-1" />
                                                    {formatPrice(product.price)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${product.stockQuantity > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : product.stockQuantity > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {product.stockQuantity} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${product.active
                                                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                                                        : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                                    }`}
                                                >
                                                    {product.active ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    )}
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(product.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                        title="View Product"
                                                    >
                                                        <View className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                                        title="Edit Product"
                                                    >
                                                        <SquarePen className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteProductId(product.id)}
                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={isDeleting}
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && !error && pageInfo.totalPages > 0 && (
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 rounded-b-xl">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page <span className="font-semibold text-gray-900">{pageInfo.number}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{pageInfo.totalPages}</span>
                                </div>
                                <Pagination
                                    currentPage={pageInfo.number}
                                    totalPages={pageInfo.totalPages}
                                    onPageChange={page => setPageInfo(prev => ({ ...prev, number: page }))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}