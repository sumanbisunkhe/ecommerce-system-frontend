'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import UserProfile, { UserDetails } from '@/components/ui/UserProfile';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';


export default function UserViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isCurrentUser = searchParams.get('isCurrentUser') === 'true';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        const response = await fetch(`${BASE_URL}/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();

        if (data.success) setUser(data.data);
        else throw new Error(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        notify.error('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchUser();
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <>
      <NotificationProvider />
      <UserProfile user={user} isCurrentUser={isCurrentUser} />
    </>
  );
}
