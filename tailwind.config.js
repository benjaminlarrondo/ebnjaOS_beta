/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F8FA",
        surface: "#FFFFFF",
        textp: "#1F2937",
        texts: "#6B7280",
        primary: "#5B6C8F",
        accent: "#7FB77E",
        borderc: "#E5E7EB",
        warning: "#F4C95D",
        danger: "#E57373"
      },
      borderRadius: { xl2: "18px" }
    }
  },
  plugins: []
}
