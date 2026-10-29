import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070A0F",
        surface: "#0F151D",
        surface2: "#151E28",
        border: "#22303D",
        ink: "#E8EEF4",
        muted: "#8C9BAB",
        primary: "#B7F34A",
        primaryHover: "#C7FF63",
        primaryInk: "#0A0F07",
        danger: "#FF5A5F",
        warning: "#FFB020",
        success: "#42D392",
        ct: "#4CC9F0",
        t: "#F0A35E",
        leetify: "#F84982",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(183,243,74,0.18), 0 18px 60px rgba(183,243,74,0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
