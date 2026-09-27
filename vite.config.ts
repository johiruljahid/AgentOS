import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'agentos-dev-api',
    apply: 'serve', // Only active during Vite dev server, never during production build
    async configureServer(server) {
      try {
        const { app } = await import('./src/server/app.ts');
        server.middlewares.use(app);
      } catch (err) {
        console.error('Failed to mount dev API handlers:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
