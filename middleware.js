import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Skip middleware for API routes, auth pages, and static files
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.') ||
      pathname === '/gender-selection'
    ) {
      return NextResponse.next();
    }

    // For now, let's disable automatic redirect to debug the issue
    // We'll handle gender checking in the component itself
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to home page and public pages without authentication
        if (pathname === '/' || pathname.startsWith('/shows/')) {
          return true;
        }
        
        // Require authentication for other protected pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};