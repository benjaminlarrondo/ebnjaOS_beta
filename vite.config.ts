import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "ebnjaOS_beta";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? `/${repoName}/` : "/",
});
