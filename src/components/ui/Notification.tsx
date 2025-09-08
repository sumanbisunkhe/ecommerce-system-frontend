'use client';

import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

/* --------------------
   Design Tokens
-------------------- */
const TOAST_CONFIG: ToastOptions = {
  duration: 3000,
  position: 'top-right',
  style: {
    maxWidth: '420px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
  },
};

const STYLES = {
  container:
    'relative flex items-start p-4 rounded-lg backdrop-blur-md border shadow-lg',
  text: 'ml-3 flex-1 text-sm font-medium leading-snug',
  closeBtn:
    'ml-3 flex-shrink-0 inline-flex rounded-md p-1 hover:bg-black/5 transition-colors',
};

/* --------------------
   Variants
-------------------- */
const VARIANTS = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    border: 'border-emerald-200',
    bg: 'bg-white',
    text: 'text-gray-900',
    bar: 'bg-emerald-500',
    shadow: 'shadow-emerald-100/40',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-rose-600" />,
    border: 'border-rose-200',
    bg: 'bg-white',
    text: 'text-gray-900',
    bar: 'bg-rose-500',
    shadow: 'shadow-rose-100/40',
  },
  loading: {
    icon: <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />,
    border: 'border-indigo-200',
    bg: 'bg-white',
    text: 'text-gray-900',
    bar: 'bg-indigo-500',
    shadow: 'shadow-indigo-100/40',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    border: 'border-blue-200',
    bg: 'bg-white',
    text: 'text-gray-900',
    bar: 'bg-blue-500',
    shadow: 'shadow-blue-100/40',
  },
};

/* --------------------
   Progress Bar
-------------------- */
const ProgressBar = ({ duration, className }: { duration: number; className: string }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 20;
    const steps = duration / interval;
    const decrement = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100 rounded-b-lg overflow-hidden">
      <div
        className={clsx('h-full transition-all ease-linear', className)}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* --------------------
   Custom Toast
-------------------- */
const CustomToast = ({
  t,
  message,
  type,
  duration,
}: {
  t: any;
  message: string;
  type: keyof typeof VARIANTS;
  duration: number;
}) => {
  const variant = VARIANTS[type];

  return (
    <div
      className={clsx(
        'transform transition-all duration-300 ease-out',
        t.visible ? 'animate-in slide-in-from-right-4 opacity-100' : 'animate-out slide-out-to-right-4 opacity-0'
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={clsx(
          STYLES.container,
          variant.bg,
          variant.border,
          variant.shadow
        )}
      >
        <div className="flex-shrink-0">{variant.icon}</div>
        <div className={clsx(STYLES.text, variant.text)}>{message}</div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className={STYLES.closeBtn}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <ProgressBar duration={duration} className={variant.bar} />
      </div>
    </div>
  );
};

/* --------------------
   Notify Utility
-------------------- */
export const notify = {
  success: (message: string, options?: Partial<ToastOptions>) =>
    toast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="success"
          duration={options?.duration || TOAST_CONFIG.duration || 4000}
        />
      ),
      { ...TOAST_CONFIG, ...options }
    ),

  error: (message: string, options?: Partial<ToastOptions>) =>
    toast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="error"
          duration={options?.duration || TOAST_CONFIG.duration || 4000}
        />
      ),
      { ...TOAST_CONFIG, ...options }
    ),

  loading: (message: string, options?: Partial<ToastOptions>) =>
    toast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="loading"
          duration={options?.duration || TOAST_CONFIG.duration || 4000}
        />
      ),
      { ...TOAST_CONFIG, ...options }
    ),

  info: (message: string, options?: Partial<ToastOptions>) =>
    toast.custom(
      (t) => (
        <CustomToast
          t={t}
          message={message}
          type="info"
          duration={options?.duration || TOAST_CONFIG.duration || 4000}
        />
      ),
      { ...TOAST_CONFIG, ...options }
    ),
};

/* --------------------
   Provider
-------------------- */
export default function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerClassName="p-4"
      toastOptions={{
        duration: TOAST_CONFIG.duration,
        style: TOAST_CONFIG.style,
      }}
    />
  );
}
