import { jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';

const SECRET_KEY = process.env.SECRET_KEY || 'ecoquest_super_secret_jwt_key_2026_finance';

/**
 * Derives the authenticated user ID from the server-side authentication mechanism.
 * This should be used in all Next.js Server Actions and API Routes to securely identify the user.
 * It enforces ownership by reading the JWT from a trusted source (Cookies or HTTP Auth Header).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  let token = '';

  try {
    // 1. Try reading from Authorization Header (Bearer token)
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } 
    // 2. Fallback to Cookie (for Server Actions / SSR)
    else {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value || '';
    }

    if (!token) {
      return null;
    }

    // Decode and verify the JWT signature
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload && payload.sub) {
      return payload.sub; // The user ID
    }

    return null;
  } catch (error) {
    // Log the error for debugging, but don't leak it to the client
    console.error('Failed to verify authentication token:', error);
    return null;
  }
}
