import type { IncomingMessage, ServerResponse } from 'http';
import { createApiApp } from '../server/app.js';

const app = createApiApp();

export default function handler(
  req: IncomingMessage & { url?: string; originalUrl?: string },
  res: ServerResponse
) {
  const rawUrl = req.url || '/';

  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    const pathParam = parsed.searchParams.get('__path');

    if (pathParam !== null) {
      parsed.searchParams.delete('__path');
      const cleanPath = pathParam.replace(/^\/+/, '');
      const qs = parsed.searchParams.toString();
      req.url = `/api/${cleanPath}${qs ? `?${qs}` : ''}`;
      req.originalUrl = req.url;
    } else if (!rawUrl.startsWith('/api')) {
      req.url = `/api${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      req.originalUrl = req.url;
    }
  } catch {
    // Keep original req.url if URL parsing fails
  }

  return app(req as any, res as any);
}
