/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d64f0",
        secondary: "#00b4d8",
        success: "#06a77d",
        warning: "#ffa630",
        danger: "#d62839",
      }
    },
  },
  plugins: [],
}
