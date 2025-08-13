import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'
import { randomBytes } from 'crypto'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const VITE_SERVER_SESSION_ID = randomBytes(16).toString('hex');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  define: {
    VITE_SERVER_SESSION_ID: JSON.stringify(VITE_SERVER_SESSION_ID),
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
