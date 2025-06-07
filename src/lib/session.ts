import { auth } from "./auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import type { Session, User } from "./auth";

/**
 * Get the current session from server-side context
 * Use this in API routes and server components
 */
export async function getSession(): Promise<{ session: Session | null; user: User | null }> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    return {
      session: sessionData?.session || null,
      user: sessionData?.user || null,
    };
  } catch (error) {
    console.error("Failed to get session:", error);
    return {
      session: null,
      user: null,
    };
  }
}

/**
 * Validate that a user is authenticated
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<{ session: Session; user: User }> {
  const { session, user } = await getSession();
  
  if (!session || !user) {
    throw new Error("Authentication required");
  }
  
  return { session, user };
}

/**
 * Check if user has a specific role
 */
export async function requireRole(requiredRole: string): Promise<{ session: Session; user: User }> {
  const { session, user } = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return { session, user };
}

/**
 * Check if user is admin
 */
export async function requireAdmin(): Promise<{ session: Session; user: User }> {
  return requireRole("admin");
}

/**
 * Get session cookie value for manual parsing (if needed)
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("better-auth.session")?.value;
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { session } = await getSession();
    return !!session;
  } catch {
    return false;
  }
}

/**
 * Get user role or return default
 */
export async function getUserRole(): Promise<string> {
  try {
    const { user } = await getSession();
    return user?.role || "user";
  } catch {
    return "user";
  }
}

/**
 * Session validation for API routes
 * Returns response object for unauthorized access
 */
export async function validateSessionForAPI() {
  try {
    const { session, user } = await getSession();
    
    if (!session || !user) {
      return {
        isValid: false,
        response: Response.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }
    
    return {
      isValid: true,
      session,
      user,
    };
  } catch (error) {
    return {
      isValid: false,
      response: Response.json(
        { error: "Session validation failed" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Role validation for API routes
 */
export async function validateRoleForAPI(requiredRole: string) {
  const validation = await validateSessionForAPI();
  
  if (!validation.isValid) {
    return validation;
  }
  
  const { user } = validation;
  
  if (user.role !== requiredRole) {
    return {
      isValid: false,
      response: Response.json(
        { error: `Role ${requiredRole} required` },
        { status: 403 }
      ),
    };
  }
  
  return validation;
}

/**
 * Admin validation for API routes
 */
export async function validateAdminForAPI() {
  return validateRoleForAPI("admin");
} 