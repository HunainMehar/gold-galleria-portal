"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function AuthRedirectWrapper({ children }) {
  const { authStatus, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip if still initializing auth state
    if (authStatus === "initializing") return;

    // Define auth routes
    const isAuthRoute =
      pathname === "/auth/login" || pathname === "/auth/reset-password";

    // Define the root route
    const isRootRoute = pathname === "/";

    // Handle redirects based on authentication status and current route
    if (isAuthenticated && isAuthRoute) {
      // Authenticated user on auth route -> redirect to dashboard
      router.push("/home/dashboard");
    } else if (!isAuthenticated && !isAuthRoute && !isRootRoute) {
      // Unauthenticated user on protected route -> redirect to login
      router.push("/auth/login");
    } else if (isRootRoute) {
      // Handle root path separately
      if (isAuthenticated) {
        router.push("/home/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [authStatus, pathname, router, isAuthenticated]);

  return children;
}
