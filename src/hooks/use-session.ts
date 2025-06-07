"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * Enhanced session hook with additional utilities
 */
export function useSession() {
  return authClient.useSession();
}

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const { data, isPending } = useSession();
  const isAuthenticated = !!data;
  const isLoading = isPending;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require a specific role - redirects if insufficient permissions
 */
export function useRequireRole(
  requiredRole: string,
  redirectTo: string = "/unauthorized"
) {
  const { data, isPending } = useSession();
  const user = data?.user;
  const isLoading = isPending;
  const isAuthenticated = !!data;
  const router = useRouter();

  const hasRole = user?.role === requiredRole;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, hasRole, router, redirectTo]);

  return { hasRole, isLoading, isAuthenticated };
}

/**
 * Hook to require admin role
 */
export function useRequireAdmin(redirectTo: string = "/unauthorized") {
  return useRequireRole("admin", redirectTo);
}

/**
 * Hook for authentication actions
 */
export function useAuth() {
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        throw new Error(result.error.message || "Sign up failed");
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  }, []);

  const signOut = useCallback(async (redirectTo?: string) => {
    try {
      await authClient.signOut();
      if (redirectTo) {
        router.push(redirectTo);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    }
  }, [router]);

  return {
    signIn,
    signUp,
    signOut,
  };
}

/**
 * Hook to check permissions
 */
export function usePermissions() {
  const { data } = useSession();
  const user = data?.user;
  const isAuthenticated = !!data;

  const hasRole = useCallback((role: string) => {
    return isAuthenticated && user?.role === role;
  }, [isAuthenticated, user?.role]);

  const isAdmin = useCallback(() => {
    return hasRole("admin");
  }, [hasRole]);

  const isUser = useCallback(() => {
    return hasRole("user");
  }, [hasRole]);

  return {
    hasRole,
    isAdmin,
    isUser,
    isAuthenticated,
  };
}

/**
 * Hook for session-aware navigation
 */
export function useSessionNavigation() {
  const { data, isPending } = useSession();
  const isAuthenticated = !!data;
  const isLoading = isPending;
  const router = useRouter();

  const navigateIfAuthenticated = useCallback((path: string) => {
    if (isAuthenticated) {
      router.push(path);
    }
  }, [isAuthenticated, router]);

  const navigateIfNotAuthenticated = useCallback((path: string) => {
    if (!isAuthenticated && !isLoading) {
      router.push(path);
    }
  }, [isAuthenticated, isLoading, router]);

  const navigateBasedOnAuth = useCallback((
    authenticatedPath: string,
    unauthenticatedPath: string
  ) => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push(authenticatedPath);
      } else {
        router.push(unauthenticatedPath);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    navigateIfAuthenticated,
    navigateIfNotAuthenticated,
    navigateBasedOnAuth,
    isLoading,
  };
} 