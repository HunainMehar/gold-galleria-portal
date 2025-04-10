"use client";

import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Ensure component is mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button
        isIconOnly
        variant="light"
        color="default"
        aria-label="Theme switcher loading"
        isDisabled
      >
        <Sun size={20} />
      </Button>
    );
  }

  return (
    <Button
      isIconOnly
      variant="light"
      color="default"
      onPress={toggleTheme}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}
