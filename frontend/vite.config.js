import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // This should match your error paths
    emptyOutDir: true
  }
});
