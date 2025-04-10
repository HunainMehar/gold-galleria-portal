"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Spinner, Card } from "@heroui/react";
import { ShieldCheck } from "lucide-react";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading, authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after we've confirmed authentication status
    if (!loading && authStatus !== "initializing" && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, authStatus, router]);

  if (loading || authStatus === "initializing") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <Card className="p-8 flex flex-col items-center space-y-4">
          <Spinner color="primary" size="lg" />
          <p className="text-foreground text-center">
            Loading your dashboard...
          </p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <Card className="p-8 flex flex-col items-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-warning" />
          <p className="text-foreground text-center">
            Access restricted. Redirecting to login...
          </p>
          <Spinner color="primary" size="sm" />
        </Card>
      </div>
    );
  }

  return children;
}
