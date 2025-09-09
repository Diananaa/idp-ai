/** @type {import('tailwindcss').Config} */
const daisyui = require("daisyui");
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#0F172A',
        primary: '#7C3AED'
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        idpTheme: {
          primary: "#2563EB",
          secondary: "#9333EA",
          accent: "#FBBF24",
          neutral: "#111827",
          "base-100": "#FFFFFF",
        },
      },
      "light",
      "dark",
    ],
  },
}
