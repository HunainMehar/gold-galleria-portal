"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Spinner } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, authStatus } = useAuth();

  // Only redirect after auth state is determined
  useEffect(() => {
    // Wait until auth state is initialized before redirecting
    if (authStatus === "initializing") {
      return;
    }

    const redirectTimer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/home/dashboard");
      } else {
        router.push("/auth/login");
      }
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [router, isAuthenticated, authStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="p-8 w-full max-w-md shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Gold Galleria Portal</h1>
        <p className="text-default-600 mb-6">
          Welcome to your Gold Galleria Portal
        </p>
        <div className="flex justify-center">
          <Spinner color="primary" size="lg" />
        </div>
        <p className="mt-4 text-default-500">
          {authStatus === "initializing"
            ? "Initializing application..."
            : "Redirecting you..."}
        </p>
      </Card>
    </div>
  );
}
