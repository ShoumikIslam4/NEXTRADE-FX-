import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import apiRouter from './api.js';

export function createApiApp() {
  const app = express();

  // Security & Parsing Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // Security HTTP Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Mount API Router
  app.use('/api', apiRouter);

  return app;
}
