/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FCFAF6",
          100: "#F7F3EA",
          200: "#EFE6D5",
          300: "#E4D5BC",
          400: "#D3BE9E",
          500: "#BAA07C",
        },
        ink: {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#D1D1D1",
          300: "#B0B0B0",
          400: "#888888",
          500: "#555555",
          600: "#383838",
          700: "#27272A",
          800: "#18181B",
          900: "#0F1117",
          950: "#090A0F",
        },
        sage: {
          DEFAULT: "#2D6A4F",
          light: "#EAF4EE",
          dark: "#1B4332",
        },
        saffron: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#92400E",
        },
        vermilion: {
          DEFAULT: "#E11D48",
          light: "#FFE4E6",
          dark: "#9F1239",
        },
        lavender: {
          DEFAULT: "#7C3AED",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        brass: {
          DEFAULT: "#B45309",
          light: "#FDF4E3",
          dark: "#78350F",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Geist", "Inter", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "Caveat", "Reenie Beanie", "cursive"],
      },
      boxShadow: {
        sketchbook: "0 10px 30px -5px rgba(45, 35, 25, 0.12), 0 20px 40px -15px rgba(0, 0, 0, 0.08)",
        "sketchbook-dark": "0 10px 35px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
        lens: "0 15px 35px -5px rgba(180, 83, 9, 0.25), 0 0 0 3px rgba(180, 83, 9, 0.35)",
        seal: "0 6px 16px rgba(225, 29, 72, 0.3)",
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(2.2) rotate(-15deg)", opacity: "0" },
          "70%": { transform: "scale(0.92) rotate(3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        wash: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        stamp: "stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        wash: "wash 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
