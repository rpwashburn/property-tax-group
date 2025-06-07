"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully signed out");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data, error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: false, // Keep user logged in on other devices
      });

      if (error) {
        if (error.message.includes("current password")) {
          toast.error("Current password is incorrect");
        } else {
          toast.error(error.message || "Failed to change password");
        }
        return;
      }

      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password changed successfully!");

    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Error loading session</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Manage your account and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Name:</label>
                <p>{session.user.name}</p>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <p>{session.user.email}</p>
              </div>
              <div>
                <label className="font-semibold">Role:</label>
                <p className="capitalize">{session.user.role || "user"}</p>
              </div>
              <div>
                <label className="font-semibold">User ID:</label>
                <p className="text-sm text-muted-foreground">{session.user.id}</p>
              </div>
            </div>
            <div className="pt-4">
              <Button 
                onClick={handleSignOut}
                variant="outline"
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
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
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                  minLength={8}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? "Changing Password..." : "Change Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 