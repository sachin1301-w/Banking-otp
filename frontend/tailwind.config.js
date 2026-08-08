/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        paper: "#F7F9FC",
        surface: "#FFFFFF",
        vault: { DEFAULT: "#0F766E", dark: "#0B5F59", light: "#14B8A6" },
        brass: { DEFAULT: "#F59E0B", light: "#FCD34D", dark: "#B45309" },
        slate: { DEFAULT: "#64748B", light: "#94A3B8" },
        brick: "#DC2626",
        line: "#E2E8F0",
        brand: { DEFAULT: "#2563EB", dark: "#1D4ED8", light: "#60A5FA" },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        stamp: "0 10px 30px rgba(15, 23, 42, 0.08)",
        card: "0 12px 40px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
