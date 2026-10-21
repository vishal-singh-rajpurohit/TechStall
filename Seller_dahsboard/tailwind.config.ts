import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (header, footer, nav): Deep Navy #0B1F3A
        primary: {
          DEFAULT: "#0B1F3A",
          50: "#F0F4FA",
          100: "#DBE4F2",
          200: "#B8CBE5",
          300: "#8FAED5",
          400: "#5D8BC1",
          500: "#366BAA",
          600: "#25518A",
          700: "#1A3D6C",
          800: "#122B4F",
          900: "#0B1F3A", // Deep Navy
          950: "#061224",
        },
        navy: {
          DEFAULT: "#0B1F3A",
          50: "#F0F4FA",
          100: "#DBE4F2",
          200: "#B8CBE5",
          300: "#8FAED5",
          400: "#5D8BC1",
          500: "#366BAA",
          600: "#25518A",
          700: "#1A3D6C",
          800: "#122B4F",
          900: "#0B1F3A",
          950: "#061224",
        },
        // Accent (links, highlights, active states): Electric Blue #2563EB
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB", // Electric Blue
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        electric: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // CTA (Add to Cart, Buy Now): Vivid Orange #FF6B1A
        cta: {
          DEFAULT: "#FF6B1A",
          hover: "#E05507",
          active: "#C2410C",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF6B1A", // Vivid Orange
          600: "#E05507",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        // Brand palette mapped to CTA Vivid Orange for backward compatibility
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF6B1A", // Vivid Orange
          600: "#FF6B1A", // Vivid Orange
          700: "#E05507",
          800: "#C2410C",
          900: "#7C2D12",
          dark: "#0B1F3A", // Deep Navy
        },
        // Background: Off-White #F7F9FC
        // Cards / surfaces: White #FFFFFF
        surface: {
          DEFAULT: "#F7F9FC",
          card: "#FFFFFF",
        },
        // Body text: Charcoal #1F2937
        // Secondary text / borders: Cool Gray #6B7280 / #E5E7EB
        charcoal: {
          DEFAULT: "#1F2937",
          muted: "#6B7280",
          border: "#E5E7EB",
        },
        // Success (in stock, discounts): Green #16A34A
        success: {
          DEFAULT: "#16A34A",
          50: "#F0FDF4",
          100: "#DCFCE7",
          600: "#16A34A",
          700: "#15803D",
        },
        // Sale / alerts: Red #DC2626
        sale: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          100: "#FEE2E2",
          600: "#DC2626",
          700: "#B91C1C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
