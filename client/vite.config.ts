import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = 'http://127.0.0.1:5000';

function proxyConfig(path: string, ws = false) {
  return {
    target: backendTarget,
    changeOrigin: true,
    ws,
    configure: (proxy: any) => {
      proxy.on('error', (_err: Error, _req: any, res: any) => {
        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              message:
                'Backend server is not running. Start it: cd server && npm run dev (or npm run dev from project root)',
            })
          );
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxyConfig('/api'),
      '/socket.io': proxyConfig('/socket.io', true),
      '/uploads': proxyConfig('/uploads'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});