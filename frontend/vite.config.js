import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // The existing demo account is configured at the project root, outside Vite's default env directory.
  const projectEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  return ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_DEMO_EMAIL': JSON.stringify(projectEnv.VITE_DEMO_EMAIL || projectEnv.DEMO_EMAIL || ''),
    'import.meta.env.VITE_DEMO_PASSWORD': JSON.stringify(projectEnv.VITE_DEMO_PASSWORD || projectEnv.DEMO_PASSWORD || ''),
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5181,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3061',
        changeOrigin: true,
      },
    },
  },
  });
});
