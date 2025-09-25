/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';



export default function KhaltiCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const token = document.cookie
                    .split(';')
                    .map(cookie => cookie.trim())
                    .find(cookie => cookie.startsWith('token='))
                    ?.split('=')[1];

                if (!token) {
                    notify.error('Authentication required');
                    setTimeout(() => router.push('/auth/login'), 2000);
                    return;
                }

                const pidx = searchParams.get('pidx');
                const orderId = searchParams.get('purchase_order_id');

                if (!pidx || !orderId) {
                    throw new Error('Invalid payment or order information');
                }

                const callbackResponse = await fetch(`${BASE_URL}/payment/khalti/callback`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${decodeURIComponent(token)}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        pidx,
                        transaction_id: searchParams.get('transaction_id'),
                        tidx: searchParams.get('tidx'),
                        txnId: searchParams.get('txnId'),
                        amount: searchParams.get('amount'),
                        total_amount: searchParams.get('total_amount'),
                        mobile: searchParams.get('mobile'),
                        status: searchParams.get('status'),
                        purchase_order_id: orderId,
                        purchase_order_name: searchParams.get('purchase_order_name')
                    })
                });

                if (!callbackResponse.ok) {
                    const errorData = await callbackResponse.json();
                    throw new Error(errorData.message || 'Payment verification failed');
                }

                const data = await callbackResponse.json();
                if (data.success) {
                    notify.success('Payment successful!');
                    setTimeout(() => {
                        router.replace(`/customer/orders/${orderId}`);
                    }, 2000);
                } else {
                    throw new Error(data.message);
                }
            } catch (error: any) {
                notify.error(error.message);
                setTimeout(() => router.push('/customer/orders'), 2000);
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
            <NotificationProvider />
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                {/* ...existing code... */}
            </div>
        </div>
    );
}
     