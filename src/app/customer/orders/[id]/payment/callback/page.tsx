/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Funnel_Sans } from "next/font/google";
import { notify } from '@/components/ui/Notification';
import { BASE_URL } from '@/config/api';


const funnelSans = Funnel_Sans({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

export default function PaymentCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const token = document.cookie
                    .split(';')
                    .map(cookie => cookie.trim())
                    .find(cookie => cookie.startsWith('token='))
                    ?.split('=')[1];

                if (!token) throw new Error('Authentication required');

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

                const data = await response.json();
                setPaymentData(data);

                if (data.success) {
                    // Show single success notification
                    setTimeout(() => {
                        const orderId = searchParams.get('purchase_order_id');
                        router.replace(`/customer/orders/${orderId}`);
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Payment verification failed');
                }
            } catch (error: any) {
                // Show single error notification
                notify.error(error.message);
                setTimeout(() => router.back(), 2000);
            } finally {
                setIsProcessing(false);
            }
        };

        if (searchParams.get('pidx')) {
            verifyPayment();
        }
    }, [searchParams, router]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Verifying Your Payment
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Please wait while we confirm your payment with Khalti...
                            </p>
                        </>
                    ) : paymentData?.success ? (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Payment Verified Successfully
                            </h2>
                            <div className="mt-4 space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Amount:</span> NPR {searchParams.get('amount')}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Transaction ID:</span> {paymentData.data.txnId}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Status:</span> {paymentData.data.status}
                                </p>
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                Returning to your order...
                            </p>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">
                                Payment Verification Failed
                            </h2>
                            <p className="mt-2 text-gray-600">
                                We couldn't verify your payment. Please try again or contact support.
                            </p>
                            <p className="mt-4 text-sm text-gray-600">
                                Returning to previous page...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
