import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for Node.js globals required by simple-peer/randombytes
    global: "globalThis",
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      // Polyfill util for simple-peer browser compatibility
      util: "util",
    },
  },
  optimizeDeps: {
    include: ["util"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // The app bundles can be legitimately large; raise the threshold to avoid
    // noisy warnings during production builds.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [],
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/e2e/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setupTests.ts"],
  },
});
