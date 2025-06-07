"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const error = searchParams.get("error");
    
    if (error === "invalid_token") {
      setIsTokenValid(false);
      toast.error("Invalid or expired reset link. Please request a new one.");
    } else if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
      toast.error("No reset token found. Please request a new reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: newPassword,
        token: token,
      });

      if (error) {
        if (error.message.includes("token")) {
          toast.error("Reset link has expired. Please request a new one.");
          setIsTokenValid(false);
        } else {
          toast.error(error.message || "Failed to reset password");
        }
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully! You can now log in.");

    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Reset links expire after 1 hour for security reasons.
              </p>
              <p className="text-sm text-muted-foreground">
                Please request a new password reset link.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Password Reset Complete!</CardTitle>
            <CardDescription>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You can now log in with your new password.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="text-center">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 