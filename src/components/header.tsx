"use client";

import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed out");
            router.push("/");
          },
        },
      });
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4 md:p-6">
        <Link href="/" className="text-2xl font-bold">
          PropertyTaxGroup
        </Link>
        
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href="/#how-it-works" className="hover:opacity-80 transition-opacity">
            How It Works
          </Link>
          <Link href="/#success-stories" className="hover:opacity-80 transition-opacity">
            Success Stories
          </Link>
          <Link href="/contact" className="hover:opacity-80 transition-opacity">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {isPending ? (
            <div className="text-sm">Loading...</div>
          ) : session ? (
            // User is authenticated
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right text-sm">
                <span className="font-medium">{session.user.name}</span>
                <span className="text-xs opacity-80">{session.user.email}</span>
              </div>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            // User is not authenticated
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-primary-foreground/20">
        <nav className="container mx-auto flex flex-wrap justify-center space-x-4 p-3 text-sm">
          <Link href="/#how-it-works" className="hover:opacity-80 transition-opacity">
            How It Works
          </Link>
          <Link href="/#success-stories" className="hover:opacity-80 transition-opacity">
            Success Stories
          </Link>
          <Link href="/contact" className="hover:opacity-80 transition-opacity">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
} 