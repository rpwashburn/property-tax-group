import { cookies, headers } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session from server-side context
 * Use this in API routes and server components
 */
export async function getSession() {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    return sessionData;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Validate that a user is authenticated
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const sessionData = await getSession();
  
  if (!sessionData?.session || !sessionData?.user) {
    throw new Error("Authentication required");
  }
  
  return sessionData;
}

/**
 * Check if user has a specific role
 */
export async function requireRole(requiredRole: string) {
  const sessionData = await requireAuth();
  
  if (sessionData.user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`);
  }
  
  return sessionData;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
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
    const sessionData = await getSession();
    return !!sessionData?.session;
  } catch {
    return false;
  }
}

/**
 * Get user role or return default
 */
export async function getUserRole(): Promise<string> {
  try {
    const sessionData = await getSession();
    return sessionData?.user?.role || "user";
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
    const sessionData = await getSession();
    
    if (!sessionData?.session || !sessionData?.user) {
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
      session: sessionData.session,
      user: sessionData.user,
    };
  } catch {
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
  
  if (!validation.isValid || !validation.user) {
    return validation;
  }
  
  if (validation.user.role !== requiredRole) {
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