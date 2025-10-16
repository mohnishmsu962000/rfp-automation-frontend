import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-brand-primary flex flex-col items-center justify-center text-white p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 mx-auto">
            <div className="w-12 h-12 border-3 border-white rounded-full relative">
              <div className="absolute inset-2 border-2 border-white rounded-full"></div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">RFPGen</h1>
          <p className="text-xl mb-8 opacity-90">AI-Powered RFP Automation</p>
          
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">10x Faster Responses</h3>
                <p className="text-white/80 text-sm">Complete RFPs in minutes, not days</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">90% Accuracy</h3>
                <p className="text-white/80 text-sm">AI-generated answers with trust scoring</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="text-3xl">📚</div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Knowledge Base</h3>
                <p className="text-white/80 text-sm">Learns from your documents automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white shadow-none',
              headerTitle: 'text-brand-primary font-bold',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-tinted rounded-[12px]',
              formButtonPrimary: 'bg-brand-primary hover:bg-brand-primary/90 rounded-[20px] font-semibold',
              formFieldInput: 'border-2 border-brand-primary rounded-[12px] focus:border-brand-primary',
              footerActionLink: 'text-brand-primary hover:text-brand-primary/80',
              identityPreviewEditButton: 'text-brand-primary',
              formResendCodeLink: 'text-brand-primary',
              otpCodeFieldInput: 'border-2 border-brand-primary rounded-[12px]',
            },
          }}
          routing="path"
          path="/auth/sign-up"
          signInUrl="/auth/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}