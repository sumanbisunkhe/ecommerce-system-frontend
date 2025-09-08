'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Fascinate } from 'next/font/google';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { notify } from '@/components/ui/Notification';
import NotificationProvider from '@/components/ui/Notification';



const fascinate = Fascinate({
  subsets: ['latin'],
  weight: '400',
});

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    notify.loading('Signing in...');

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.data.token}; path=/; max-age=86400`;
        document.cookie = `user=${JSON.stringify(data.data.user)}; path=/; max-age=86400`;

        notify.success('Login successful! Welcome back.');
        if (data.data.user.roles.includes('ADMIN')) router.push('/admin/analytics');
        else if (data.data.user.roles.includes('MERCHANT')) router.push('/merchant');
        else router.push('/customer');
      } else {
        const errorData = await response.json();
        let message = errorData.message || 'Login failed';
        // Custom error handling for common cases
        if (response.status === 401) {
          message = 'Invalid login credentials.';
        } else if (response.status === 404) {
          message = 'User not found.';
        } else if (errorData.message && errorData.message.toLowerCase().includes('disabled')) {
          message = 'Your account is disabled. Please contact support.';
        } else if (errorData.message && errorData.message.toLowerCase().includes('locked')) {
          message = 'Your account is locked. Please contact support.';
        }
        notify.error(message);
      }
    } catch {
      notify.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <NotificationProvider />
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <span
            className={`${fascinate.className} text-black text-3xl font-bold tracking-widest transition-all duration-200`}
          >
            HoT🔥sHoP
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-1xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <FloatingInput
            id="usernameOrEmail"
            name="usernameOrEmail"
            type="text"
            label="Username or Email"
            value={formData.usernameOrEmail}
            onChange={handleChange}
          />
          <FloatingInput
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              Remember me
            </label>
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FloatingInput({
  id,
  name,
  type,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isPassword && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=" "
        required
        className="peer block w-full px-3 pt-5 pb-2 border border-gray-300 rounded-md text-gray-900 placeholder-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-150 ease-in-out pointer-events-none bg-white px-1
          ${isFocused || value ? '-top-2 text-xs text-indigo-600' : 'top-2.5 text-gray-400 text-sm'}
        `}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      )}
    </div>
  );
}
