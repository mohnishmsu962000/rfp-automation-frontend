'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiOutlineHome, 
  HiOutlineCircleStack,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { SignOutButton } from '@clerk/nextjs';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: HiOutlineHome, label: 'Home', exact: true },
    { href: '/dashboard/knowledge-base', icon: HiOutlineCircleStack, label: 'Knowledge Base' },
    { href: '/dashboard/rfps', icon: HiOutlineDocumentText, label: 'RFPs' },
    { href: '/dashboard/settings', icon: HiOutlineCog6Tooth, label: 'Settings' }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 z-50 flex flex-col">
      <Link 
        href="/dashboard" 
        className="h-20 flex items-center justify-center group relative"
      >
        <div className="w-8 h-8 rounded-[20px] bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded"></div>
        </div>
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          RFPGen
        </div>
      </Link>
      
      <nav className="flex-1 flex flex-col items-center justify-center space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group w-full flex justify-center"
            >
              <div
                className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-200 ${
                  active 
                    ? 'bg-brand-primary text-white' 
                    : 'text-gray-700 hover:text-brand-primary'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2">
        <button className="group relative w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-gray-700 hover:text-brand-primary transition-all duration-200">
          <HiOutlineQuestionMarkCircle className="w-6 h-6" />
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Support
          </div>
        </button>

        <SignOutButton redirectUrl="/auth/sign-in">
          <button className="group relative w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-gray-700 hover:text-red-600 transition-all duration-200">
            <HiOutlineArrowRightOnRectangle className="w-6 h-6" />
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}