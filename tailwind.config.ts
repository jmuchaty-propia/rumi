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
        ink: "#1C1427",
        surface: "#FAF8FF",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#C4B5FD",
          dark: "#4C1D95",
        },
        accent: "#7C3AED",
        muted: "#6B7280",
        whatsapp: "#25D366",
        "rumi-soft": "#EDE9FE",
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
