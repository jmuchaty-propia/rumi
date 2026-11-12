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
        ink: "#1C1530",
        surface: "#FCFBFF",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#DDD6FE",
          dark: "#5B21B6",
        },
        accent: "#7C3AED",
        muted: "#64748B",
        whatsapp: "#25D366",
        "rumi-soft": "#F5F3FF",
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
