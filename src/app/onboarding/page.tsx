'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganizationList } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { createApiClient } from '@/lib/api-client';
import { FiArrowRight, FiLoader } from 'react-icons/fi';

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const { createOrganization, setActive } = useOrganizationList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }
  
    setIsSubmitting(true);
    try {
      if (!createOrganization) {
        throw new Error('Organization creation not available');
      }
      
      const org = await createOrganization({ name: companyName });
      
      console.log('Clerk organization created:', org.id);
      
      if (setActive) {
        await setActive({ organization: org.id });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const apiClient = createApiClient(getToken);
      await apiClient.patch('/api/users/me', {
        company_name: companyName,
        clerk_organization_id: org.id
      });
      
      toast.success('Company created successfully!');
      router.push('/onboarding/knowledge-base');
      
    } catch (error) {
      toast.error('Failed to create company');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(139, 92, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>
      </div>

      <div className="absolute top-1/4 left-1/4">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl rotate-12 opacity-50"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/3">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl px-4">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-medium">1</div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">2</div>
          </div>
          
          <h1 className="text-4xl font-light mb-3 bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
            Welcome to ScaleRFP
          </h1>
          <p className="text-center text-gray-600 font-light">Let&apos;s get your workspace set up</p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Company Information</h2>
            <p className="text-sm text-gray-500 font-light">Tell us about your organization</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-light text-base"
                placeholder="e.g., Acme Corporation"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-primary to-purple-500 text-white py-4 rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all font-light text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}