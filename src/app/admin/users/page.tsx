/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Users, 
  Shield, 
  UserCheck,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Settings2,
  User2,
  Eye as View,
  SquarePen,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';
import { BASE_URL } from '@/config/api';


// Google Fonts
import { Funnel_Sans,Markazi_Text } from 'next/font/google';
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });


interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  roles: string[];
  active: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
}

interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    size: 5,
    number: 1,
    totalElements: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
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

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(
        `${BASE_URL}/users?search=${searchTerm}&page=${pageInfo.number}&size=${pageInfo.size}&sortBy=${sortBy}&ascending=${sortOrder === 'asc'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.content);
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
    fetchUsers();
  }, [fetchUsers]);

  // Delete user handler
  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      notify.success('User deleted successfully');
      fetchUsers(); // Refresh the users list
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`${BASE_URL}/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle user status');
      }

      notify.success(`User status ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers(); // Refresh the users list
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to toggle user status');
    }
  };

  // Skeleton rows
  const renderSkeletonRows = () =>
    Array.from({ length: pageInfo.size }).map((_, idx) => (
      <tr key={idx}>
        {Array.from({ length: 7 }).map((_, tdIdx) => (
          <td key={tdIdx} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </td>
        ))}
      </tr>
    ));

  const getSortIcon = () => {
    if (sortOrder === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    } else {
      return <ArrowDown className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    const sortLabels = {
      updatedAt: 'Last Updated',
      createdAt: 'Created Date', 
      firstName: 'Name'
    };
    return sortLabels[sortBy as keyof typeof sortLabels] || 'Sort';
  };

  return (
    <div className={`space-y-6 px-2 ${funnelSans.className}`}>
      <NotificationProvider />
      <ConfirmDialog
        isOpen={deleteUserId !== null}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteUserId && handleDeleteUser(deleteUserId)}
        onCancel={() => setDeleteUserId(null)}
      />
      
      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Enhanced Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-4">
            {/* Search - Takes up most space */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
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
                  <option value="firstName">Name</option>
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

            {/* Page Size Control */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer min-w-[120px]"
                  value={pageInfo.size}
                  onChange={e => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), number: 1 }))}
                >
                  {[5, 10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Settings2 className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {!isLoading && !error && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>
                  Showing <span className="font-semibold text-gray-900">{users.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{pageInfo.totalElements}</span> users
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
                {['ID', 'Profile', 'Name', 'Email', 'Roles', 'Status', 'Actions'].map((th, idx) => (
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
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-600 text-sm font-medium">{error}</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <User2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.profilePictureUrl ? (
                        <Image
                          src={user.profilePictureUrl}
                          alt={`${user.firstName}'s profile`}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-gray-200">
                          <User2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.middleName || ''} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md font-medium"
                          >
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                          user.active 
                            ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                            : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        {user.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/users/${user.id}`} 
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View User"
                        >
                          <View className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Edit User"
                        >
                          <SquarePen className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting}
                          title="Delete User"
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
    </div>
  );
}