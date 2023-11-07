/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-color)",
        bg2: "var(--bg2-color)",
        bg3: "var(--bg3-color)",
        primary: "var(--primary-color)",
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
