/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // paleta afinada: tons de oficina/capulana, mais quentes e
        // menos "flat" que a versão inicial — os nomes mantêm-se
        // iguais, por isso nenhuma classe existente parte
        ink: "#1A1D24",
        paper: "#F6F1E6",
        rust: "#BD5B28",
        rustdark: "#96461E",
        green: "#2B6249",
        ochre: "#D9A23B",
        steel: "#262F3B",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,29,36,0.04), 0 10px 22px -14px rgba(26,29,36,0.14)",
        popover: "0 20px 45px -18px rgba(26,29,36,0.35)",
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.15rem",
      },
    },
  },
  plugins: [],
};
