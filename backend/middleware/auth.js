import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '../db.js';

const DEFAULT_EXPIRES_IN = '7d';
const DEFAULT_COOKIE_DAYS = 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function getTokenFromRequest(req) {
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

export function createAuthToken(userId) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

export function setAuthCookie(res, token) {
  const daysRaw = Number(process.env.AUTH_COOKIE_DAYS);
  const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : DEFAULT_COOKIE_DAYS;
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: days * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
}

export async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    if (!payload?.sub) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    const users = await getUsersCollection();
    let userId;
    try {
      userId = new ObjectId(payload.sub);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Account not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
