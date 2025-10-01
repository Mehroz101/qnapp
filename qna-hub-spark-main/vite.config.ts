// vite.config.ts
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { manifestForPlugIn } from "./manifest";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "robots.txt"],
      manifest: manifestForPlugIn, // ✅ now this is just the pure manifest
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/qwizzy-zeta\.vercel\.app\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "document" ||
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-cache",
            },
          },
        ],
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
