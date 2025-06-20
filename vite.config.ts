// IMPORTANT NOTE: This file is only used in two situations: local development, and the live preview in Workbench.
// For deployed Sparks, the `server/main.ts` serves the app itself. Ensure consistency between this file and `server/main.ts`
// if you have something that needs to available while deployed.

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import { createLogToFileLogger } from "@github/spark/logToFileLogger";
import { runtimeTelemetryPlugin } from "@github/spark/telemetryPlugin";
import sparkAgent from "@github/spark/agent-plugin";
import { tagSourcePlugin, designerHost } from "@github/spark/designerPlugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const extraPlugins: PluginOption[] = [];

const GITHUB_RUNTIME_PERMANENT_NAME = process.env.GITHUB_RUNTIME_PERMANENT_NAME || process.env.CODESPACE_NAME?.substring(0, 20);
const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    createIconImportProxy(),
    react(),
    tailwindcss(),
    runtimeTelemetryPlugin(),
    sparkAgent({ serverURL: process.env.SPARK_AGENT_URL }) as PluginOption,
    tagSourcePlugin() as PluginOption, 
    designerHost() as PluginOption,
  ],
  build: {
    outDir: process.env.OUTPUT_DIR || 'dist'
  },
  define: {
    // ensure that you give these types in `src/vite-end.d.ts`
    GITHUB_RUNTIME_PERMANENT_NAME: JSON.stringify(GITHUB_RUNTIME_PERMANENT_NAME),
    BASE_KV_SERVICE_URL: JSON.stringify("/_spark/kv"),
  },
  server: {
    port: 5000,
    hmr: {
      overlay: false,
    },
    cors: {
      origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\]|(?:.*\.)?github\.com)(?::\d+)?$/
    },
    watch: {
      ignored: [
        "**/prd.md", 
        "**.log", 
        "**/.azcopy/**",
      ],
      awaitWriteFinish: {
        pollInterval: 50,
        stabilityThreshold: 100,
      },
    },
    warmup: {
      clientFiles: [
        "./src/App.tsx",
        "./src/index.css",
        "./index.html",
        "./src/**/*.tsx",
        "./src/**/*.ts",
        "./src/**/*.jsx",
        "./src/**/*.js",
        "./src/styles/theme.css",
      ],
    },
    proxy: {
      // This proxies everything under /_spark to our backend servers.
      // This is used in local development and in the live preview.
      // Deployed sparks route through ACA for /_spark.k
      "^/_spark/.*": {
        target: "http://localhost:8000",
        changeOrigin: true,
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  customLogger: createLogToFileLogger(),
});
