import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "숲속의 아침" 테마
        forest: {
          50:  "#f0f7f2",
          100: "#d9ede0",
          200: "#b3dbc2",
          300: "#7ec29e",
          400: "#4da37a",
          500: "#2D5A3D", // 메인 Forest Green
          600: "#254d34",
          700: "#1e3f2b",
          800: "#183222",
          900: "#122519",
        },
        moss: {
          50:  "#f5f7f0",
          100: "#e7edda",
          200: "#cfdab8",
          300: "#b0c48e",
          400: "#8eab65",
          500: "#6B8F47",
          600: "#5a773b",
          700: "#496030",
          800: "#3a4c26",
          900: "#2d3b1e",
        },
        earth: {
          50:  "#faf7f2",
          100: "#f2ebe0",
          200: "#e4d5c0",
          300: "#d1b897",
          400: "#bc976b",
          500: "#A67C52",
          600: "#8c6843",
          700: "#715436",
          800: "#5a432c",
          900: "#463524",
        },
        sky: {
          50:  "#eef6ff",
          100: "#d9eaff",
          200: "#b3d5ff",
          300: "#7ab6ff",
          400: "#3d92ff",
          500: "#1A6FFF",
          600: "#0055e0",
          700: "#0044b5",
          800: "#003694",
          900: "#002d7a",
        },
        warm: {
          50:  "#fff9f0",
          100: "#fef0d9",
          200: "#fcdcab",
          300: "#f9c275",
          400: "#f6a43c",
          500: "#F4891A",
          600: "#d97006",
          700: "#b45a07",
          800: "#92470d",
          900: "#783b0e",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "var(--font-geist-sans)", "sans-serif"],
        serif: ["Nanum Myeongjo", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "grow-tree": {
          "0%": { transform: "scaleY(0)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom" },
        },
        "leaf-sway": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "grow-tree": "grow-tree 1.2s ease-out",
        "leaf-sway": "leaf-sway 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
