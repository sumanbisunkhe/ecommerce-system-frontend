'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Icons
import { ChevronLeft, Tag, FileText, PlusCircle, Loader2 } from 'lucide-react';

// Notifications
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';

// Fonts
import { Funnel_Sans, Markazi_Text } from 'next/font/google';
const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });
const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });

// Types
interface CategoryFormData {
    name: string;
    description: string;
}

export default function NewCategoryPage() {
    const router = useRouter();

    // State
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handlers
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch('http://localhost:8080/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify.success('✅ Category created successfully');
                router.push('/admin/categories');
            } else {
                throw new Error(data.message || 'Failed to create category');
            }
        } catch (err) {
            notify.error(err instanceof Error ? err.message : 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-gray-50 px-6 py-8 mt-6 rounded-lg ${funnelSans.className}`}>
            <NotificationProvider />

            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Link>
                <h1
                    className={`text-3xl font-bold text-gray-900 flex items-center gap-2 ${markaziText.className}`}
                >
                    Add Category
                </h1>
            </div>

            {/* Form */}
            <main className="max-w-8xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8  mb-4">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Category Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="flex items-center text-sm font-medium text-gray-700 mb-4"
                            >
                                <Tag className="w-4 h-4 mr-2 text-indigo-600" />
                                Category Name*
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter category name"
                                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-gray-200 focus:ring-0 transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="flex items-center text-sm font-medium text-gray-700 mb-4"
                            >
                                <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                                Description*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={5}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter category description"
                                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm transition-colors resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 ">
                            <Link
                                href="/admin/categories"
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Save Category
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
