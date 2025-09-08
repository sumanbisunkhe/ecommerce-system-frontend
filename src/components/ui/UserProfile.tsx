'use client';

import { User2, Mail, MapPin, Flag, Calendar, Shield, CircleUser, Edit, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Funnel_Sans, Markazi_Text } from 'next/font/google';

const funnelSans = Funnel_Sans({ subsets: ['latin'], weight: '400' });
export const markaziText = Markazi_Text({ subsets: ['latin'], weight: ['400', '600', '700'] });

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  address: string;
  country: string;
  profilePictureUrl: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

interface UserProfileProps {
  user: UserDetails;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className={`bg-gray-50 py-10 px-6 rounded-lg ${funnelSans.className}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/users"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 gap-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <h1 className={`${markaziText.className} text-3xl font-bold text-gray-900`}>
              Profile Information
            </h1>
          </Link>

          <Link
            href={`/admin/users/${user.id}/edit`}
            className="text-gray-500 hover:text-gray-800"
          >
            <Edit className="h-5 w-5" />
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col md:flex-row md:items-center md:space-x-8">
          {/* Avatar */}
          <div>
            {user.profilePictureUrl ? (
              <Image
                src={user.profilePictureUrl}
                alt="profile"
                width={120}
                height={120}
                className="rounded-full border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <User2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 md:mt-0">
            <h2 className={`${markaziText.className} text-4xl font-semibold text-gray-900`}>
              {user.firstName} {user.middleName} {user.lastName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <CircleUser className="h-4 w-4 mr-1" /> {user.username}
              </span>
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" /> {user.email}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  user.active
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {user.active ? 'Active' : 'Inactive'}
              </span>
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card title="Personal Information">
            <InfoItem icon={<MapPin />} label="Address" value={user.address} />
            <InfoItem icon={<Flag />} label="Country" value={user.country} />
            <InfoItem icon={<User2 />} label="Gender" value={user.gender} />
          </Card>

          {/* Account Info */}
          <Card title="Account Information">
            <InfoItem
              icon={<Calendar />}
              label="Created At"
              value={new Date(user.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <InfoItem
              icon={<Calendar />}
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="py-3 flex items-start gap-3">
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
