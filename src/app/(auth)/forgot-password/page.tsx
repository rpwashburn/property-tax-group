"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await authClient.forgetPassword({
        email: email.trim(),
        redirectTo: "/reset-password", // Where users will be redirected after clicking the email link
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");

    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. 
                The link will expire in 1 hour.
              </p>
              <p className="text-sm text-muted-foreground">
                Don&apos;t see the email? Check your spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => {
                setIsSuccess(false);
                setEmail("");
              }}
              variant="outline" 
              className="w-full"
            >
              Send Another Email
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <div className="text-center space-x-4">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
              <span className="text-sm text-muted-foreground">•</span>
              <Link href="/register" className="text-sm text-blue-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 