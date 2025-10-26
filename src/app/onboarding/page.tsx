'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization, useOrganizationList } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { createApiClient } from '@/lib/api-client';
import { FiArrowRight, FiLoader } from 'react-icons/fi';

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [rfpsPerMonth, setRfpsPerMonth] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: { infinite: true } });

  useEffect(() => {

    if (organization?.name) {
      setCompanyName(organization.name);
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }
  
    setIsSubmitting(true);
    try {

      const orgId = organization?.id || userMemberships?.data?.[0]?.organization?.id;
      
      if (!orgId) {
        throw new Error('No organization found. Please contact support.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const apiClient = createApiClient(getToken);
      await apiClient.patch('/api/users/me', {
        company_name: companyName,
        clerk_organization_id: orgId,
        rfps_per_month: rfpsPerMonth,
        team_size: teamSize,
        industry: industry
      });
      
      toast.success('Company profile created!');
      router.push('/onboarding/knowledge-base');
      
    } catch (error) {
      toast.error('Failed to create company profile');
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
            <p className="text-sm text-gray-500 font-light">Help us understand your needs</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                placeholder="e.g., Acme Corporation"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                required
                disabled={isSubmitting}
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="consulting">Consulting</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFPs per month
              </label>
              <select
                value={rfpsPerMonth}
                onChange={(e) => setRfpsPerMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                required
                disabled={isSubmitting}
              >
                <option value="">Select range</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
                <option value="21-50">21-50</option>
                <option value="50+">50+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                required
                disabled={isSubmitting}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
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