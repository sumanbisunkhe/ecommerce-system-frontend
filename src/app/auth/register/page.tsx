'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Fascinate, Funnel_Sans } from 'next/font/google';

const fascinate = Fascinate({
  subsets: ['latin'],
  weight: '400',
});

const funnelSans = Funnel_Sans({
  subsets: ['latin'],
  weight: '400',
});

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    address: '',
    country: 'Nepal',
    isActive: true,
    roles: ['CUSTOMER'],
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/auth/login?message=Registration successful. Please login.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className={`w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 ${funnelSans.className}`}>
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
          <h2 className="text-1xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <FloatingInput
              id="email"
              name="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <FloatingInput
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FloatingInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FloatingInput
              id="middleName"
              name="middleName"
              label="Middle Name (Optional)"
              value={formData.middleName}
              onChange={handleChange}
            />
            <FloatingInput
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <FloatingInput
            id="address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingSelect
              id="gender"
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'MALE' },
                { label: 'Female', value: 'FEMALE' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />
            <FloatingInput
              id="country"
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Floating input */
function FloatingInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=" "
        required={name !== 'middleName'}
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
    </div>
  );
}

/* Floating select */
function FloatingSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-150 ease-in-out pointer-events-none bg-white px-1
          ${isFocused || value ? '-top-2 text-xs text-indigo-600' : 'top-2.5 text-gray-400 text-sm'}
        `}
      >
        {label}
      </label>
    </div>
  );
}
