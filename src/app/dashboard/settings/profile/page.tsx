'use client';

import { UserProfile } from '@clerk/nextjs';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Card>
        <UserProfile 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border-0',
            }
          }}
        />
      </Card>
    </div>
  );
}