'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, SquarePen, Trash2, FileText, Calendar } from 'lucide-react';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

export default function CategoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const response = await fetch(`http://localhost:8080/categories/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch category');
        const data = await response.json();

        if (data.success) {
          setCategory(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCategory();
    }
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`http://localhost:8080/categories/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }

      notify.success('Category deleted successfully');
      router.push('/admin/categories');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className={`${funnelSans.className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <p className="text-gray-500">Loading category details...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className={`${funnelSans.className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">{error || 'Category not found'}</p>
          <Link
            href="/admin/categories"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${funnelSans.className} bg-gray-50 py-10 px-6 rounded-lg mt-5`}>
      <NotificationProvider />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <h1 className={`${markaziText.className} text-3xl font-bold text-gray-900`}>
              Category Details
            </h1>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/${category.id}/edit`}
              className="text-gray-500 hover:text-gray-800"
            >
              <SquarePen className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Single-row cards */}
        <Card title="Category Information">
          <InfoItem icon={<FileText className="h-4 w-4" />} label="Name" value={category.name} />
          <InfoItem label="Description" value={category.description} />
        </Card>

        <Card title="Timestamps">
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label="Created At"
            value={formatDate(category.createdAt)}
          />
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label="Last Updated"
            value={formatDate(category.updatedAt)}
          />
        </Card>
      </div>
    </div>
  );
}

/* Reusable Components */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <FileText className="h-5 w-5 text-indigo-500" />
        {title}
      </h2>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="py-3 flex items-start gap-4">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
