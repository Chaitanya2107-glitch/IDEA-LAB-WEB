import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Vercel functions in api/ aren't served by Vite; forward /api to a running backend
        // (a deployed URL, or `vercel dev` on its default port).
        proxy: {
          '/api': {
            target: env.API_PROXY_TARGET || 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        ViteImageOptimizer({
          png: { quality: 80 },
          jpeg: { quality: 80 },
          jpg: { quality: 80 },
          webp: { lossless: true },
          svg: {
            multipass: true,
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    cleanupIds: false,
                    removeViewBox: false,
                  },
                },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
