import { NextRequest } from 'next/server';
import { authProxy } from './proxy';

export async function middleware(req: NextRequest) {
  return authProxy(req);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
