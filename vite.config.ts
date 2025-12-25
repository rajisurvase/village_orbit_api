import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
      devOptions: {
        enabled: false,
        type: "module",
      },
      manifest: {
        name: "शिवनखेड (खु) ग्रामपंचायत",
        short_name: "शिवनखेड (खु)",
        description: "Official Gram Panchayat website for accessing government schemes, development projects, and village services",
        theme_color: "#1a4d2e",
        background_color: "#1a4d2e",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/favicon.ico",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        categories: ["education", "government", "utilities", "lifestyle"],
        shortcuts: [
          {
            name: "Take Exam",
            url: "/exam",
            description: "Access online exams"
          },
          {
            name: "Buy & Sell",
            url: "/buy-sell",
            description: "Village marketplace"
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"],
          carousel: ["embla-carousel-react", "embla-carousel-autoplay"]
        }
      }
    },
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}));
