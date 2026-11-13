import crypto from 'crypto';

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  'nextrade-fx-institutional-hmac-secret-2026-v1';

const KEY = crypto.scryptSync(SECRET, 'nextrade-salt-2026', 32);

export interface SignedSessionPayload {
  sid: string;
  uid: string;
  email: string;
  fullName: string;
  role: string;
  kycStatus: string;
  country?: string;
  phone?: string;
  referralCode?: string;
  exp: number;
}

export interface AccountCheckpointPayload {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  phone?: string;
  country?: string;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
}

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function signSessionToken(payload: SignedSessionPayload): string {
  const body = toBase64Url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', KEY).update(body).digest('base64url');
  return `nx1.${body}.${sig}`;
}

export function verifySessionToken(token: string): SignedSessionPayload | null {
  try {
    if (!token || !token.startsWith('nx1.')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, body, sig] = parts;
    const expected = crypto.createHmac('sha256', KEY).update(body).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const parsed = JSON.parse(fromBase64Url(body)) as SignedSessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function encryptAccountCheckpoint(payload: AccountCheckpointPayload): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptAccountCheckpoint(token: string): AccountCheckpointPayload | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const encrypted = Buffer.from(dataB64, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    return JSON.parse(decrypted) as AccountCheckpointPayload;
  } catch {
    return null;
  }
}
