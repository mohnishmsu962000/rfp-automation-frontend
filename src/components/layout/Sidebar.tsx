'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiHome, 
  HiCircleStack,
  HiDocumentText,
  HiCog6Tooth,
  HiQuestionMarkCircle,
  HiUser
} from 'react-icons/hi2';
import { SignOutButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: HiHome, label: 'Home', exact: true },
    { href: '/dashboard/knowledge-base', icon: HiCircleStack, label: 'Knowledge Base' },
    { href: '/dashboard/rfps', icon: HiDocumentText, label: 'RFPs' },
    { href: '/dashboard/settings', icon: HiCog6Tooth, label: 'Settings' }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 w-32 h-screen flex items-center justify-start pl-8 z-50">
      <div className="bg-brand-primary rounded-[32px] shadow-lg px-6 py-8 flex flex-col items-center space-y-6">
        <Link href="/dashboard" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center relative group">
          <div className="w-6 h-6 border-2 border-white rounded-full relative">
            <div className="absolute inset-1 border border-white rounded-full"></div>
          </div>
          <div className="absolute left-full ml-3 px-3 py-2 bg-white border border-gray-200 text-brand-primary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-sm">
            RFPGen
          </div>
        </Link>
        
        <div className="w-10 h-px bg-white/30"></div>
        
        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 rounded-[20px] flex items-center justify-center relative group transition-colors ${
                  active ? 'bg-white/30' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-6 h-6 text-white" />
                <div className="absolute left-full ml-3 px-3 py-2 bg-white border border-gray-200 text-brand-primary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-sm">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="w-10 h-px bg-white/30"></div>

        <button className="w-12 h-12 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors group relative">
          <HiQuestionMarkCircle className="w-6 h-6 text-white" />
          <div className="absolute left-full ml-3 px-3 py-2 bg-white border border-gray-200 text-brand-primary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-sm">
            Support
          </div>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors group"
          >
            <HiUser className="w-6 h-6 text-white" />
          </button>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              
              <div className="absolute bottom-full left-full ml-3 mb-2 w-48 bg-white border border-gray-100 rounded-[20px] shadow-lg py-2 z-20">
                <SignOutButton redirectUrl="/auth/sign-in">
                  <button className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </SignOutButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}