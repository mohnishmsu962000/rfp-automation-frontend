import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/auth(.*)', '/terms', '/privacy', '/contact']);
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  if (!isPublicRoute(request) && !isOnboardingRoute(request)) {
    const { userId, orgId } = await auth();
    
    if (userId && orgId) {
      try {
        const token = await auth().getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 404) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};