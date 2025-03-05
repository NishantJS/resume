import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "main-font": ["Rubik", ...fontFamily.sans],
        "sub-font": ['"Londrina Outline"', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
