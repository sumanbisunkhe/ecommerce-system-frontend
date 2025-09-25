/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

function KhaltiCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

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

                // Build URL with all parameters from searchParams
                const params = new URLSearchParams();
                searchParams.forEach((value, key) => {
                    params.append(key, value);
                });

                const response = await fetch(`${BASE_URL}/payment/khalti/callback?${params.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${decodeURIComponent(token)}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Payment verification failed');
                }

                const data = await response.json();
                setPaymentData(data);

                if (data.success) {
                    setIsSuccess(true);
                    notify.success('Payment successful!');
                    // Delay redirect to show success message
                    const orderId = searchParams.get('purchase_order_id');
                    setTimeout(() => {
                        router.replace(`/customer/orders/${orderId}`);
                    }, 3000);
                } else {
                    throw new Error(data.message || 'Payment verification failed');
                }
            } catch (error: any) {
                setIsSuccess(false);
                notify.error(error.message);
                setTimeout(() => router.push('/customer/orders'), 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    return (
        <div className={`${funnelSans.className} min-h-screen flex items-center justify-center bg-gray-50 p-4`}>
            <NotificationProvider />
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Processing Payment</h2>
                            <p className="mt-2 text-gray-600">Please wait while we verify your payment...</p>
                        </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful!</h2>
                            {paymentData && (
                                <div className="mt-4 space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Amount: NPR {searchParams.get('amount')}</p>
                                    <p className="text-sm text-gray-600">Transaction ID: {paymentData.data.txnId}</p>
                                    <p className="text-sm text-gray-600">Status: {paymentData.data.status}</p>
                                    <p className="text-sm text-gray-600">Order: {searchParams.get('purchase_order_name')}</p>
                                </div>
                            )}
                            <p className="mt-4 text-gray-600">Redirecting to your order details...</p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Failed</h2>
                            <p className="mt-2 text-gray-600">There was an issue processing your payment.</p>
                            <p className="mt-4 text-gray-600">Redirecting to orders...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return <div>Loading payment details...</div>
}

export default function KhaltiCallbackPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <KhaltiCallbackContent />
        </Suspense>
    )
}