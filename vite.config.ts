import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // GitHub Pages 사용자 사이트 - 루트 경로
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // process.env 노출 경고 해결 - 특정 환경변수만 정의
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          three: ["three"],
        },
      },
    },
  },
});
