/* eslint-disable react/no-unescaped-entities */
'use client'; 
import React, { useState, useEffect, useCallback } from 'react'; 
import { View, SquarePen, Trash2, Search, ArrowUp, ArrowDown, Settings2, Filter, LayoutGrid ,CopyPlus} from 'lucide-react'; 
import Link from 'next/link'; 
import debounce from 'lodash/debounce'; 
import ConfirmDialog from '@/components/ui/ConfirmDialog'; 
import { notify } from '@/components/ui/Notification'; 
import NotificationProvider from '@/components/ui/Notification'; 
import Pagination from '@/components/ui/pagination'; 
import { BASE_URL } from '@/config/api';
// Google Fonts 
import { Funnel_Sans, Markazi_Text } from 'next/font/google'; 
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' }); 
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] }); 

interface Category { 
  id: number; 
  name: string; 
  description: string; 
  createdAt: string; 
  updatedAt: string; 
} 

interface PageInfo { 
  size: number; 
  number: number; 
  totalElements: number; 
  totalPages: number; 
} 

export default function CategoriesPage() { 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [categories, setCategories] = useState<Category[]>([]); 
  const [pageInfo, setPageInfo] = useState<PageInfo>({ 
    size: 5, 
    number: 1, 
    totalElements: 0, 
    totalPages: 0, 
  }); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [sortBy, setSortBy] = useState('updatedAt'); 
  const [sortOrder, setSortOrder] = useState('desc'); 

  // Debounced search 
  const debouncedSearch = useCallback( 
    debounce((value: string) => { 
      setSearchTerm(value); 
      setPageInfo(prev => ({ ...prev, number: 1 })); 
    }, 500), 
    [] 
  ); 

  // Fetch categories 
  const fetchCategories = useCallback(async () => { 
    setIsLoading(true); 
    setError(''); 
    try { 
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]; 
      const response = await fetch( 
        `${BASE_URL}/categories?search=${searchTerm}&page=${pageInfo.number}&size=${pageInfo.size}&sortBy=${sortBy}&ascending=${sortOrder === 'asc'}`, 
        { headers: { Authorization: `Bearer ${token}` } } 
      ); 
      if (!response.ok) throw new Error('Failed to fetch categories'); 
      const data = await response.json(); 
      if (data.success) { 
        setCategories(data.data.content); 
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
  }, [searchTerm, pageInfo.number, pageInfo.size, sortBy, sortOrder]); 

  useEffect(() => { 
    fetchCategories(); 
  }, [fetchCategories]); 

  // Delete category handler 
  const handleDeleteCategory = async (categoryId: number) => { 
    setIsDeleting(true); 
    try { 
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]; 
      const response = await fetch(`${BASE_URL}/categories/${categoryId}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      }); 
      if (!response.ok) { 
        const error = await response.json(); 
        throw new Error(error.message || 'Failed to delete category'); 
      } 
      notify.success('Category deleted successfully'); 
      fetchCategories(); 
    } catch (err) { 
      notify.error(err instanceof Error ? err.message : 'Failed to delete category'); 
    } finally { 
      setIsDeleting(false); 
      setDeleteCategoryId(null); 
    } 
  }; 

  // Skeleton loader 
  const renderSkeletonRows = () => Array.from({ length: pageInfo.size }).map((_, idx) => ( 
    <tr key={idx}> 
      {Array.from({ length: 5 }).map((_, tdIdx) => ( 
        <td key={tdIdx} className="px-6 py-4"> 
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div> 
        </td> 
      ))} 
    </tr> 
  )); 

  const getSortIcon = () => { 
    return sortOrder === 'asc' ? ( 
      <ArrowUp className="w-4 h-4" /> 
    ) : ( 
      <ArrowDown className="w-4 h-4" /> 
    ); 
  }; 

  return ( 
    <div className={`space-y-6 px-2 ${funnelSans.className}`}> 
      <div className={`fixed top-0 z-10 transition-all duration-300 left-64 right-0 bg-white border-b px-6 py-4`}> 
        <h1 className={`text-2xl font-bold text-gray-900 ${markaziText.className}`}> 
          Categories 
        </h1> 
      </div> 
      <main className="space-y-6 px-4"> 
        <NotificationProvider /> 
        <ConfirmDialog 
          isOpen={deleteCategoryId !== null}
          title="Delete Category"
          message="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
          onCancel={() => setDeleteCategoryId(null)}
        />
        
        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Controls */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Search - Increased width */}
                <div className="max-w-xl flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories by name or description..."
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    onChange={e => debouncedSearch(e.target.value)}
                  />
                </div>

                {/* Sort Control */}
                <div className="flex items-center">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="updatedAt">Last Updated</option>
                      <option value="createdAt">Created Date</option>
                      <option value="name">Name</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={() => setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))}
                    className="ml-2 p-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-600 hover:text-gray-700"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {getSortIcon()}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300"></div>

                {/* Page Size */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer min-w-[120px]"
                      value={pageInfo.size}
                      onChange={e => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), number: 1 }))}
                    >
                      {[5, 10, 20, 50, 100].map(n => (
                        <option key={n} value={n}>{n} per page</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Settings2 className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/categories/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <CopyPlus className="w-4 h-4" />
                New Category
              </Link>
            </div>

            {/* Results Summary */}
            {!isLoading && !error && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>
                    Showing <span className="font-semibold text-gray-900">{categories.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{pageInfo.totalElements}</span> categories
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Name', 'Description', 'Last Updated', 'Actions'].map((th, idx) => (
                    <th key={idx} className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-red-600 text-sm font-medium">{error}</div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <LayoutGrid className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-sm font-medium">No categories found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                        <p className="text-xs text-gray-400 mt-1">
                          No categories found. Please create your first category.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-gray-600">
                        #{category.id}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-600 line-clamp-2">{category.description}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                        {new Date(category.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Category"
                          >
                            <View className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="Edit Category"
                          >
                            <SquarePen className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteCategoryId(category.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                            title="Delete Category"
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