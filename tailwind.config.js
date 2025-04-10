import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#ffffff",
            foreground: "#000000",
            primary: {
              DEFAULT: "#000000",
              foreground: "#ffffff",
              50: "#f5f5f5",
              100: "#e5e5e5",
              200: "#d4d4d4",
              300: "#a3a3a3",
              400: "#737373",
              500: "#525252",
              600: "#404040",
              700: "#262626",
              800: "#171717",
              900: "#0a0a0a",
            },
            secondary: {
              DEFAULT: "#f4f4f4",
              foreground: "#000000",
            },
            default: {
              DEFAULT: "#f4f4f4",
              foreground: "#000000",
            },
          },
          layout: {
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "1px",
            },
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ffffff",
            primary: {
              DEFAULT: "#ffffff",
              foreground: "#000000",
              50: "#171717",
              100: "#262626",
              200: "#404040",
              300: "#525252",
              400: "#737373",
              500: "#a3a3a3",
              600: "#d4d4d4",
              700: "#e5e5e5",
              800: "#f5f5f5",
              900: "#ffffff",
            },
            secondary: {
              DEFAULT: "#171717",
              foreground: "#ffffff",
            },
            default: {
              DEFAULT: "#171717",
              foreground: "#ffffff",
            },
          },
          layout: {
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "1px",
            },
          },
        },
      },
    }),
  ],
}

module.exports = config;