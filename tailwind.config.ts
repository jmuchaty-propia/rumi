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
        ink: "#0F172A",
        surface: "#FAFEFF",
        primary: {
          DEFAULT: "#0284C7",
          light: "#BAE6FD",
          dark: "#075985",
        },
        accent: "#0284C7",
        muted: "#64748B",
        whatsapp: "#25D366",
        "rumi-soft": "#F0F9FF",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1024px",
      },
    },
  },
  plugins: [],
};
export default config;
