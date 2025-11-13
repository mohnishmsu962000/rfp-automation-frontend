'use client';

import { useState } from 'react';
import { useUsageStats, useBillingPlan } from '@/hooks/useStats';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createApiClient } from '@/lib/api-client';
import { FiCheck, FiX, FiZap, FiTrendingUp, FiMail } from 'react-icons/fi';
import { HiRocketLaunch } from 'react-icons/hi2';
import { toast } from 'sonner';

const PLANS = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out ScaleRFP',
    icon: FiZap,
    features: [
      { text: '2 RFPs per month', included: true },
      { text: '10 documents', included: true },
      { text: '1 team member', included: true },
      { text: 'Basic support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    price: 3999,
    description: 'Great for small teams getting started',
    icon: FiTrendingUp,
    features: [
      { text: '10 RFPs per month', included: true },
      { text: '50 documents', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: false },
    ],
  },
  {
    tier: 'growth',
    name: 'Growth',
    price: 7999,
    description: 'For growing teams with more RFPs',
    icon: HiRocketLaunch,
    popular: true,
    features: [
      { text: '25 RFPs per month', included: true },
      { text: '150 documents', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: true },
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 15999,
    description: 'For high-volume RFP teams',
    icon: HiRocketLaunch,
    features: [
      { text: '100 RFPs per month', included: true },
      { text: '500 documents', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: true },
    ],
  },
];

export default function BillingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: plan, isLoading: planLoading } = useBillingPlan();
  const { data: usage, isLoading: usageLoading } = useUsageStats();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get('/api/users/me');
      return data;
    },
  });

  const handleUpgradeRequest = async (tier: string) => {
    setSelectedPlan(tier);
    setIsSubmitting(true);

    try {
      const selectedPlanData = PLANS.find(p => p.tier === tier);
      const emailBody = `Upgrade Request\n\nUser: ${user?.fullName || user?.primaryEmailAddress?.emailAddress}\nEmail: ${user?.primaryEmailAddress?.emailAddress}\nCompany: ${userData?.company_name}\nCurrent Plan: ${plan?.tier || 'free'}\nRequested Plan: ${selectedPlanData?.name} ($${selectedPlanData?.price}/month)`;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User',
          email: user?.primaryEmailAddress?.emailAddress || '',
          subject: `Plan Upgrade Request: ${selectedPlanData?.name}`,
          message: emailBody,
        }),
      });

      if (response.ok) {
        toast.success('Upgrade request sent! Our team will contact you within 24 hours.');
        setSelectedPlan(null);
      } else {
        toast.error('Failed to send request. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (planLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const currentTier = plan?.tier || 'free';
  const rfpUsed = usage?.rfps?.used ?? 0;
  const rfpLimit = usage?.rfps?.limit ?? 2;
  const rfpRemaining = usage?.rfps?.remaining ?? (rfpLimit - rfpUsed);
  const docUsed = usage?.docs?.used ?? 0;
  const docLimit = usage?.docs?.limit ?? 10;
  const docRemaining = usage?.docs?.remaining ?? (docLimit - docUsed);

  const getRfpPercentage = () => (rfpUsed / rfpLimit) * 100;
  const getDocPercentage = () => (docUsed / docLimit) * 100;

  const canUpgrade = (tier: string) => {
    const tierOrder = ['free', 'starter', 'growth', 'pro'];
    return tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);
  };

  return (
    <div className="space-y-8 mt-6 px-6">
      {(getRfpPercentage() > 80 || getDocPercentage() > 80) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-500 rounded-full p-2">
              <FiZap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 text-lg">Running Low on Quota!</h3>
              <p className="text-yellow-800 mt-1">
                You have used {rfpUsed} out of {rfpLimit} RFPs and {docUsed} out of {docLimit} documents this month.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Usage This Month</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">RFPs Processed</span>
              <span className="text-2xl font-bold text-blue-600">{rfpUsed} / {rfpLimit}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all bg-blue-600"
                style={{ width: Math.min(getRfpPercentage(), 100) + '%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{rfpRemaining} RFPs remaining</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">Documents Uploaded</span>
              <span className="text-2xl font-bold text-green-600">{docUsed} / {docLimit}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all bg-green-600"
                style={{ width: Math.min(getDocPercentage(), 100) + '%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{docRemaining} documents remaining</p>
          </div>
        </div>
      </div>

      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-gray-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600">Our team will contact you within 24 hours to complete your upgrade</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((planOption) => {
            const Icon = planOption.icon;
            const isCurrentPlan = planOption.tier === currentTier;

            return (
              <div
                key={planOption.tier}
                className="relative rounded-xl border border-gray-200 p-6 bg-white transition-all hover:shadow-xl"
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">{planOption.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-medium text-gray-900">INR {planOption.price}</span>
                    {planOption.price > 0 && <span className="text-gray-500">/month</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{planOption.description}</p>
                </div>

                <button
                  onClick={() => canUpgrade(planOption.tier) && handleUpgradeRequest(planOption.tier)}
                  disabled={isCurrentPlan || !canUpgrade(planOption.tier) || isSubmitting}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6 bg-gradient-to-r from-brand-primary to-purple-600 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && selectedPlan === planOption.tier ? (
                    <>Sending...</>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : canUpgrade(planOption.tier) ? (
                    <>
                      <FiMail className="h-4 w-4" />
                      Request Upgrade
                    </>
                  ) : (
                    'Not Available'
                  )}
                </button>

                <div className="space-y-3">
                  {planOption.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <FiX className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 rounded-full p-3">
            <HiRocketLaunch className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">Need a custom plan?</h3>
            <p className="text-gray-700 mb-3">
              Processing more than 100 RFPs per month? Contact us for enterprise pricing.
            </p>
            <a
              href="mailto:sales@scalerfp.com"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}