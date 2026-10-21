import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In dev, forward /api requests to the Express server.
    proxy: { "/api": "http://localhost:3001" },
  },
});