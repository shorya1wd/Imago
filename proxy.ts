import { clerkMiddleware ,createRouteMatcher} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/home',
  '/videos(.*)',
  '/social-share(.*)',
  '/image-gallery'
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/videos(.*)',
  '/videos(.*)',
  '/api/image-upload',
  '/api/images/public'
]);

export default clerkMiddleware(async (auth,req)=>{
  const {userId}=await auth()
  const currentUrl=new URL(req.url)
  const isHomePage=currentUrl.pathname==='/home'  
  const isApiRequest=currentUrl.pathname.startsWith('/api')

  if (currentUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (userId && (currentUrl.pathname === '/sign-in' || currentUrl.pathname === '/sign-up' || currentUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // Protect private routes for logged-out users
  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  return NextResponse.next()
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};