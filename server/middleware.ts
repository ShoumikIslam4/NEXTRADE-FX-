import { Request, Response, NextFunction } from 'express';
import { db, UserRecord, SessionRecord } from './db.js';
import { verifySessionToken } from './authToken.js';

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  session?: SessionRecord;
}

// Track explicitly logged-out token IDs in memory
export const revokedTokenIds = new Set<string>();

// In-memory rate limiting map for login and sensitive auth endpoints
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxAttempts) {
      const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many attempts. Rate limit exceeded. Please try again in ${waitSeconds} seconds.`
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

// Extract session token from HTTP-only cookie or Authorization Bearer header
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const cookieSession = req.cookies?.nextrade_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const sessionToken = bearerToken || cookieSession;

  if (!sessionToken) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No active session found.'
    });
    return;
  }

  // 1. Check local persistent session store first
  let session = db.findSession(sessionToken);
  let user: UserRecord | undefined;

  if (session) {
    user = db.findUserById(session.userId);
  } else {
    // 2. Fallback: verify HMAC-SHA256 signed stateless token (survives Vercel serverless cold starts & reloads)
    const signed = verifySessionToken(sessionToken);
    if (signed && !revokedTokenIds.has(signed.sid)) {
      user = db.findUserById(signed.uid) || db.findUserByEmail(signed.email);
      if (!user) {
        user = db.rehydrateUserFromSignedData({
          id: signed.uid,
          fullName: signed.fullName,
          email: signed.email,
          role: signed.role,
          kycStatus: signed.kycStatus as any,
          country: signed.country,
          phone: signed.phone,
          referralCode: signed.referralCode
        });
      }
      session = {
        id: signed.sid,
        userId: user.id,
        expiresAt: signed.exp,
        createdAt: new Date().toISOString()
      };
    }
  }

  if (!session) {
    res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please sign in again.'
    });
    return;
  }

  if (!user || !user.isActive) {
    db.destroySession(sessionToken);
    res.status(403).json({
      success: false,
      message: 'Account is deactivated or not found.'
    });
    return;
  }

  req.user = user;
  req.session = session;
  next();
}

// Strict RBAC: Require SUPER_ADMIN role
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    db.addAuditLog({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
      resource: req.originalUrl,
      details: `User with role ${req.user.role} attempted forbidden admin access.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(403).json({
      success: false,
      message: 'Forbidden. Super Administrator privileges are required to access this resource.'
    });
    return;
  }

  next();
}

// Granular RBAC: Require specific permission category
export function requirePermission(category: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Super Admin has all permissions unconditionally
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check staff permissions
    const staff = db.getAllStaff().find(s => s.email.toLowerCase() === req.user?.email.toLowerCase());
    if (!staff || staff.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Forbidden. Active staff credentials required.' });
      return;
    }

    const hasCategory = staff.permissions.includes(category as any);
    if (!hasCategory) {
      db.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'FORBIDDEN_PERMISSION_ACCESS',
        resource: req.originalUrl,
        details: `Staff member ${staff.name} (${staff.staffId}) lacking required permission [${category}] attempted access.`,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
      });

      res.status(403).json({
        success: false,
        message: `Forbidden. You do not possess the required permission: [${category}].`
      });
      return;
    }

    next();
  };
}

export function requireStaffOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const staff = db.getAllStaff().find(s => s.email.toLowerCase() === req.user?.email.toLowerCase());
  if (staff && staff.status === 'ACTIVE') {
    return next();
  }

  res.status(403).json({ success: false, message: 'Forbidden. Administrative or staff credentials required.' });
}
