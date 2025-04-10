"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";
import AuthRedirectWrapper from "@/components/auth/auth-redirect-wrapper";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["light", "dark"]}
    >
      <HeroUIProvider>
        <ToastProvider />
        <AuthProvider>
          <AuthRedirectWrapper>{children}</AuthRedirectWrapper>
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
