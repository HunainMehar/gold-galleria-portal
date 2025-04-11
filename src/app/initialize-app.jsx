"use client";

import { useEffect } from "react";
import { checkAndCreateImagesBucket } from "@/lib/supabase/client";

export default function InitializeApp({ children }) {
  useEffect(() => {
    // Check and initialize the Supabase storage bucket for images
    const initStorage = async () => {
      try {
        const success = await checkAndCreateImagesBucket();
        if (success) {
          console.log("Storage initialized successfully");
        } else {
          console.error("Failed to initialize storage");
        }
      } catch (error) {
        console.error("Error initializing storage:", error);
      }
    };

    initStorage();
  }, []);

  return <>{children}</>;
}
