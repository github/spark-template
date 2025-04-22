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

const extraPlugins: PluginOption[] = [];

if (process.env.USE_DESIGNER === "true") {
  // Even though these types are exactly the type of our array, technically the types are coming
  // from different versions of the same package, so we need to cast them to **this** package's type.
  // Notice that it's coming from the `spark-designer` folder, which is a different package
  // that includes its own version of `vite`.
  extraPlugins.push([tagSourcePlugin() as PluginOption, designerHost() as PluginOption]);
}

if (process.env.USE_SPARK_AGENT === "true") {
  // See above comment about the type casting.
  extraPlugins.push(sparkAgent({ serverURL: process.env.SPARK_AGENT_URL }) as PluginOption);
}

const GITHUB_RUNTIME_PERMANENT_NAME = process.env.GITHUB_RUNTIME_PERMANENT_NAME || process.env.CODESPACE_NAME?.substring(0, 20);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    createIconImportProxy(),
    react(),
    tailwindcss(),
    runtimeTelemetryPlugin(),
    ...extraPlugins,
  ],
  define: {
    // ensure that you give these types in `src/vite-end.d.ts`
    GITHUB_RUNTIME_PERMANENT_NAME: JSON.stringify(GITHUB_RUNTIME_PERMANENT_NAME),
    BASE_KV_SERVICE_URL: JSON.stringify("/kv"),
  },
  server: {
    port: 5000,
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: ["**/prd.md", "**.log"],
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
      // Any new endpoints defined in the backend server need to be added here
      // as vite serves the frontend during local development and in the live preview,
      // and needs to know to proxy the endpoints to the backend server.
      "/kv": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/llm": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/workspaces/spark-template/src"
    }
  },
  customLogger: createLogToFileLogger(),
});