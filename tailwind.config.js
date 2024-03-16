const fontFamily = require("tailwindcss/defaultTheme").fontFamily;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "main-font": ["Rubik", ...fontFamily.sans],
        "sub-font": ['"Londrina Outline"', ...fontFamily.sans],
      }
    },
  },
  plugins: [],
};