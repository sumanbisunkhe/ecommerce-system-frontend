'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { View, SquarePen, Trash2, User2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import Pagination from '@/components/ui/pagination';

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

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setPageInfo(prev => ({ ...prev, number: 0 }));
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
        `http://localhost:8080/users?search=${searchTerm}&page=${Math.max(
          0,
          pageInfo.number
        )}&size=${pageInfo.size}&sortBy=updatedAt&ascending=false`,
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
  }, [searchTerm, pageInfo.number, pageInfo.size]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Delete user handler
  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
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
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold text-gray-900 ${markaziText.className}`}>Users Management</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition">
          <FaUserPlus />
          Add New User
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Search + Page size */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              onChange={e => debouncedSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={pageInfo.size}
            onChange={e => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), number: 0 }))}
          >
            {[5, 10, 20, 50, 100].map(n => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                {['ID', 'Profile', 'Name', 'Email', 'Roles', 'Status', 'Actions'].map((th, idx) => (
                  <th key={idx} className="px-6 py-3 text-left uppercase tracking-wide text-xs">
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
                  <td colSpan={7} className="px-6 py-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.profilePictureUrl ? (
                        <Image
                          src={user.profilePictureUrl}
                          alt={`${user.firstName}'s profile`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.firstName} {user.middleName || ''} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                          >
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900 transition">
                          <View className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 transition"
                        >
                          <SquarePen className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="text-red-600 hover:text-red-900 transition"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-5 h-5" />
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
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{users.length}</span> of{' '}
              <span className="font-medium">{pageInfo.totalElements}</span> results
            </p>
            <Pagination
              currentPage={pageInfo.number}
              totalPages={pageInfo.totalPages}
              onPageChange={page => setPageInfo(prev => ({ ...prev, number: page }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
