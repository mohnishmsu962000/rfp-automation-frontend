'use client';

import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    const firstOrg = userMemberships.data?.[0]?.organization;
    
    if (firstOrg && setActive) {
      setActive({ organization: firstOrg.id });
    }
  }, [user, userMemberships.data, setActive]);

  return <>{children}</>;
}