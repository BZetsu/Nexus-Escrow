import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        main: "#4CFF53",
        second: "#151515",
        third: "#F3F3F3",
        textColor: "#8B8B8B",
      },

      fontFamily: {
        mynamarButton: "mynamarButton",
        myanmar: ["Myanmar Text", "sans-serif"],
        mulish: ["Mulish", "sans-serif"],
        myanmar_khyay: ["mynamarKhyay", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
