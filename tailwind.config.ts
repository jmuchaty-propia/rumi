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
        ink: "#1A1A2E",
        surface: "#FAFAF7",
        primary: {
          DEFAULT: "#2D6A4F",
          light: "#B7E4C7",
          dark: "#1B4332",
        },
        accent: "#E5A220",
        muted: "#6B7280",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1024px",
      },
    },
  },
  plugins: [],
};
export default config;
