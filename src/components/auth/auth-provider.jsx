"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState("initializing"); // initializing, authenticated, unauthenticated
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setAuthStatus("unauthenticated");
          setLoading(false);
          return;
        }

        if (data?.session) {
          setUser(data.session.user);
          setAuthStatus("authenticated");
        } else {
          setUser(null);
          setAuthStatus("unauthenticated");
        }

        setLoading(false);

        // Set up auth state change listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange((event, session) => {
          console.log(`Auth event: ${event}`);

          if (session) {
            setUser(session.user);
            setAuthStatus("authenticated");
          } else {
            setUser(null);
            setAuthStatus("unauthenticated");
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setAuthStatus("unauthenticated");
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      setAuthStatus("authenticated");

      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setAuthStatus("unauthenticated");

      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Password reset functions
  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?type=recovery`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      authStatus,
      isAuthenticated: authStatus === "authenticated",
      signIn,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, loading, authStatus, signIn, signOut, resetPassword, updatePassword]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
