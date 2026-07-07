import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/home',
  '/videos(.*)',
  '/social-share(.*)',
  '/image-gallery',
  '/api/webhooks/cloudinary(.*)'
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/videos(.*)',
  '/api/image-upload',
  '/api/images/public',
  '/api/download'
]); 

export default clerkMiddleware(async (auth, req) => {
  // Fetch auth state once
  const authObject = await auth();
  const { userId } = authObject;
  
  const currentUrl = new URL(req.url);

  // 1. Redirect root to home
  if (currentUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // 2. Redirect logged-in users away from auth pages
  if (userId && (currentUrl.pathname === '/sign-in' || currentUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // 3. Protect private routes
  // If the route is NOT a public page AND NOT a public API route, force login.
  if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
    if (!userId) {
      return authObject.redirectToSignIn();
    }
  }

  // 4. Allow request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except for static files and internal Next.js files
    '/((?!_next|.*\\..*).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};