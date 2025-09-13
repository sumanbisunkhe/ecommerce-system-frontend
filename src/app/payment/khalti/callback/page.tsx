'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';

const funnelSans = Funnel_Sans({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

export default function PaymentCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

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
                if (!pidx) {
                    throw new Error('Invalid payment ID');
                }

                // Collect all callback parameters
                const callbackParams = {
                    pidx: pidx,
                    transaction_id: searchParams.get('transaction_id') || '',
                    tidx: searchParams.get('tidx') || '',
                    txnId: searchParams.get('txnId') || '',
                    amount: searchParams.get('amount') || '',
                    total_amount: searchParams.get('total_amount') || '',
                    mobile: searchParams.get('mobile') || '',
                    status: searchParams.get('status') || '',
                    purchase_order_id: searchParams.get('purchase_order_id') || '',
                    purchase_order_name: searchParams.get('purchase_order_name') || ''
                };

                const callbackResponse = await fetch('http://localhost:8080/payment/khalti/callback', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${decodeURIComponent(token)}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(callbackParams)
                });

                if (!callbackResponse.ok) {
                    const errorData = await callbackResponse.json();
                    throw new Error(errorData.message || 'Payment callback failed');
                }

                const callbackData = await callbackResponse.json();
                if (callbackData.success) {
                    setIsSuccess(true);
                    notify.success('Payment successful!');
                    setTimeout(() => {
                        router.push(`/customer/orders/${callbackParams.purchase_order_id}`);
                    }, 2000);
                } else {
                    throw new Error(callbackData.message);
                }
            } catch (error: any) {
                notify.error(error.message);
                setTimeout(() => router.push('/customer/orders'), 2000);
            } finally {
                setIsProcessing(false);
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    return (
        <div className={`${funnelSans.className} min-h-screen flex items-center justify-center bg-gray-50`}>
            <NotificationProvider />
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Verifying Payment
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Please wait while we verify your payment...
                            </p>
                        </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Payment Successful
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Your payment has been verified. Redirecting...
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Payment Verification Failed
                            </h2>
                            <p className="mt-2 text-gray-600">
                                There was an issue verifying your payment. Redirecting...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}