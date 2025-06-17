import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

// Better URL detection for production environments
function getBaseURL() {
  // If NEXT_PUBLIC_BETTER_AUTH_URL is set, use it
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  
  // In production, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to localhost for development
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [inferAdditionalFields<typeof auth>()],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user; 