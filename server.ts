import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApiApp } from './server/app.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApiApp();
  const PORT = process.env.PORT || 3000;

  // Development vs Production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : Number(PORT);
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`[NEXTRADE FX] Full-Stack Server running on http://0.0.0.0:${portNumber}`);
  });
}

startServer().catch(err => {
  console.error('[NEXTRADE FX] Failed to start server:', err);
  process.exit(1);
});
