import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import 'dotenv/config';
import { defineConfig, Plugin } from 'vite';
import {
  handleTaskPlan,
  handleEnqueueTask,
  handleResumeTask,
  handleCancelTask,
  handleGetTaskStatus,
  handleBrowserbaseStatus,
  handleSearchGrounding,
  handleMapsGrounding,
  handleAnalyzeImage,
  handleGenerateImage,
  handleBrowserAction,
} from './src/server/api-handlers';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'agentos-dev-api',
    configureServer(server) {
      server.middlewares.use(express.json({ limit: '20mb' }));

      // Attach json() and status() helper for native http.ServerResponse in Vite dev mode
      server.middlewares.use((req, res, next) => {
        if (!(res as any).json) {
          (res as any).json = function (data: any) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
          };
        }
        if (!(res as any).status) {
          (res as any).status = function (code: number) {
            this.statusCode = code;
            return this;
          };
        }
        next();
      });
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        if (req.method === 'POST') {
          if (url === '/api/agent/plan') return handleTaskPlan(req as any, res as any);
          if (url === '/api/tasks/enqueue') return handleEnqueueTask(req as any, res as any);
          if (url === '/api/tasks/resume') return handleResumeTask(req as any, res as any);
          if (url === '/api/tasks/cancel') return handleCancelTask(req as any, res as any);
          if (url === '/api/agent/grounding/search') return handleSearchGrounding(req as any, res as any);
          if (url === '/api/agent/grounding/maps') return handleMapsGrounding(req as any, res as any);
          if (url === '/api/agent/analyze-image') return handleAnalyzeImage(req as any, res as any);
          if (url === '/api/agent/generate-image') return handleGenerateImage(req as any, res as any);
          if (url === '/api/agent/browser-action') return handleBrowserAction(req as any, res as any);
        }

        if (req.method === 'GET') {
          if (url.startsWith('/api/tasks/status/')) {
            const taskId = url.replace('/api/tasks/status/', '');
            (req as any).params = { taskId };
            return handleGetTaskStatus(req as any, res as any);
          }
          if (url === '/api/browserbase/status') {
            return handleBrowserbaseStatus(req as any, res as any);
          }
          if (url === '/api/health') {
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                status: 'ok',
                service: 'AgentOS Autonomous Engine (Dev)',
                worker: 'Active Background Daemon',
                time: new Date().toISOString(),
              })
            );
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
