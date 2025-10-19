'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiUser, FiBriefcase, FiCreditCard } from 'react-icons/fi';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isProfile = pathname.includes('/profile');
  const isCompany = pathname.includes('/company');
  const isBilling = pathname.includes('/billing');

  return (
    <div className="p-8 px-16 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-3xl font-medium mb-3 bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="flex items-center gap-8 border-b border-gray-200">
        <button
          onClick={() => router.push('/dashboard/settings/profile')}
          className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors relative ${
            isProfile
              ? 'text-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiUser className="h-4 w-4" />
          <span>Profile</span>
          {isProfile && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/settings/company')}
          className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors relative ${
            isCompany
              ? 'text-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiBriefcase className="h-4 w-4" />
          <span>Company</span>
          {isCompany && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/settings/billing')}
          className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors relative ${
            isBilling
              ? 'text-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCreditCard className="h-4 w-4" />
          <span>Billing</span>
          {isBilling && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>
          )}
        </button>
      </div>

      {children}
    </div>
  );
}