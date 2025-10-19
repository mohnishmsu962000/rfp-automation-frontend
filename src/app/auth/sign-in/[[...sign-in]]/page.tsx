import { SignIn } from '@clerk/nextjs';
import { FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';

export default function SignInPage() {
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
      <div className="absolute top-1/2 right-1/4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl -rotate-6 opacity-50"></div>
      </div>
      <div className="absolute top-1/3 right-1/2">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 rounded-3xl rotate-45 opacity-50"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/3">
        <div className="w-28 h-28 bg-gradient-to-br from-pink-200 to-purple-300 rounded-2xl -rotate-12 opacity-50"></div>
      </div>
      <div className="absolute top-20 left-20">
        <div className="w-36 h-36 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40"></div>
      </div>
      <div className="absolute bottom-32 right-32">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl rotate-12 opacity-40"></div>
      </div>

      <div className="absolute top-32 left-32 flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-3 rounded-full border border-purple-100/50 shadow-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <FiZap className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-light">10x faster responses</span>
      </div>

      <div className="absolute bottom-40 left-48 flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-3 rounded-full border border-purple-100/50 shadow-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
          <FiShield className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-light">90%+ accuracy</span>
      </div>

      <div className="absolute top-48 right-40 flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-3 rounded-full border border-purple-100/50 shadow-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
          <FiTrendingUp className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-700 font-light">AI-powered insights</span>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-light mb-2 bg-gradient-to-r from-brand-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            RFPGen
          </h1>
          <p className="text-gray-500 text-sm font-light">Automate your RFP responses with AI</p>
        </div>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-light text-gray-800 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm font-light">Sign in to continue</p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-white/90 backdrop-blur-xl shadow-xl border border-white/50 rounded-2xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border border-gray-200 hover:border-brand-primary text-gray-700 hover:bg-purple-50 rounded-lg transition-all font-light',
              socialButtonsBlockButtonText: 'font-light',
              dividerLine: 'bg-gray-100',
              dividerText: 'text-gray-400 text-xs',
              formButtonPrimary: 'bg-gradient-to-r from-brand-primary to-purple-500 hover:shadow-lg hover:shadow-purple-200 rounded-lg font-light transition-all',
              formFieldInput: 'border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all font-light',
              formFieldLabel: 'text-gray-600 font-light text-sm',
              footerActionLink: 'text-brand-primary hover:text-purple-600 font-light',
              identityPreviewEditButton: 'text-brand-primary hover:text-purple-600',
              formResendCodeLink: 'text-brand-primary hover:text-purple-600',
              otpCodeFieldInput: 'border border-gray-200 rounded-lg focus:border-brand-primary',
            },
          }}
          routing="path"
          path="/auth/sign-in"
          signUpUrl="/auth/sign-up"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}