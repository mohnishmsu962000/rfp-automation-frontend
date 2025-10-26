'use client';

import { UserProfile } from '@clerk/nextjs';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <div>
      <UserProfile 
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border-0',
            }
          }}
        />
    
    </div>
  );
}