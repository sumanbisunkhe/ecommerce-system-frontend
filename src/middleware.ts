import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the routes that require authentication
const protectedRoutes = ['/admin', '/merchant', '/customer', '/checkout']
const authRoutes = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const user = request.cookies.get('user')?.value

  // Allow payment callback routes without standard auth checks
  if (pathname.includes('/payment/khalti/callback')) {
    return NextResponse.next()
  }

  // Allow payment callback parameters to pass through
  if (searchParams.has('pidx') && pathname.startsWith('/customer/orders/')) {
    return NextResponse.next()
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.includes(pathname)
  
  // If user is logged in and tries to access auth routes, redirect to appropriate dashboard
  if (token && user && isAuthRoute) {
    try {
      const userData = JSON.parse(user)
      if (userData.roles.includes('ADMIN')) {
        return NextResponse.redirect(new URL('/admin/analytics', request.url))
      } else if (userData.roles.includes('CUSTOMER')) {
        return NextResponse.redirect(new URL('/customer/products', request.url))
      }
    } catch {
      // If user data is invalid, clear cookies and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }
  }
  
  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('token')
    response.cookies.delete('user')
    return response
  }
  
  // If user has token and is accessing protected route, verify role access
  if (token && user && isProtectedRoute) {
    try {
      const userData = JSON.parse(user)
      
      // Admin can access all routes
      if (userData.roles.includes('ADMIN')) {
        return NextResponse.next()
      }

      
      // Customer can only access customer routes
      if (userData.roles.includes('CUSTOMER')) {
        // Redirect root customer path to products
        if (pathname === '/customer') {
          return NextResponse.redirect(new URL('/customer/products', request.url))
        }
        return NextResponse.next()
      }
      
      // If user doesn't have access to the route, redirect to their dashboard
      if (userData.roles.includes('MERCHANT')) {
        return NextResponse.redirect(new URL('/merchant', request.url))
      } else if (userData.roles.includes('CUSTOMER')) {
        return NextResponse.redirect(new URL('/customer/products', request.url))
      }
      
    } catch {
      // If user data is invalid, clear cookies and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }
  }
  
  return NextResponse.next()
}

// Configure which routes the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}