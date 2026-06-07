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
    // Match all paths except for static files and internal Next.js files
    '/((?!_next|.*\\..*).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};