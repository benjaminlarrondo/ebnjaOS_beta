/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        surface2: "var(--color-surface-2)",
        textp: "var(--color-text-primary)",
        texts: "var(--color-text-secondary)",
        primary: "var(--color-primary)",
        primary2: "var(--color-primary-2)",
        accent: "var(--color-accent)",
        borderc: "var(--color-border)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      }
    }
  },
  plugins: []
}
