'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiUser, FiBriefcase, FiCreditCard, FiExternalLink } from 'react-icons/fi';

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
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-semibold bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD] bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/settings/profile')}
          className={`group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isProfile
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200'
          }`}
        >
          <FiUser className={`h-4 w-4 transition-transform duration-200 ${isProfile ? 'scale-110' : ''}`} />
          My Profile
          {isProfile && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/settings/company')}
          className={`group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isCompany
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200'
          }`}
        >
          <FiBriefcase className={`h-4 w-4 transition-transform duration-200 ${isCompany ? 'scale-110' : ''}`} />
          Company
          {isCompany && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard/settings/billing')}
          className={`group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            isBilling
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200'
          }`}
        >
          <FiCreditCard className={`h-4 w-4 transition-transform duration-200 ${isBilling ? 'scale-110' : ''}`} />
          Billing
          <FiExternalLink className="h-3 w-3" />
          {isBilling && (
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
          )}
        </button>
      </div>

      {children}
    </div>
  );
}