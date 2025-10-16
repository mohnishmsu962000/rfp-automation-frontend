import { SignOutButton } from '@clerk/nextjs';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-brand-primary">Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome to RFP Automation Platform</p>
      <SignOutButton redirectUrl="/auth/sign-in">
        <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}