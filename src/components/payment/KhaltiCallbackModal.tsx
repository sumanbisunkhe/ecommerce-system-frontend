'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { notify } from '@/components/ui/Notification';

interface KhaltiCallbackModalProps {
    searchParams: URLSearchParams;
    onClose: () => void;
    onSuccess: () => void;
}

export default function KhaltiCallbackModal({ searchParams, onClose, onSuccess }: KhaltiCallbackModalProps) {
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

                const response = await fetch(`http://localhost:8080/payment/khalti/callback?${searchParams.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${decodeURIComponent(token)}`,
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();
                setPaymentData(data);

                if (data.success) {
                    notify.success('Payment successful!');
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                    }, 2000);
                } else {
                    throw new Error(data.message);
                }
            } catch (error: any) {
                notify.error(error.message);
                setTimeout(onClose, 2000);
            } finally {
                setIsProcessing(false);
            }
        };

        verifyPayment();
    }, [searchParams, onClose, onSuccess]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Processing Payment</h2>
                            <p className="mt-2 text-gray-600">Please wait while we verify your payment...</p>
                        </>
                    ) : paymentData?.success ? (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful!</h2>
                            <div className="mt-4 space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Amount: NPR {searchParams.get('amount')}</p>
                                <p className="text-sm text-gray-600">Transaction ID: {paymentData.data.txnId}</p>
                                <p className="text-sm text-gray-600">Status: {paymentData.data.status}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Failed</h2>
                            <p className="mt-2 text-gray-600">There was an issue processing your payment.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
