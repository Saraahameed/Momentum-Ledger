import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getUsersCollection } from '../db.js';
import { clearAuthCookie, createAuthToken, requireAuth, setAuthCookie } from '../middleware/auth.js';

const router = Router();
const MIN_PASSWORD_LENGTH = 8;
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    name: user.name || '',
    email: user.email || '',
    createdAt: user.createdAt
  };
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  const users = await getUsersCollection();
  const existing = await users.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();
  const user = {
    name,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };

  let savedUser;
  try {
    const result = await users.insertOne(user);
    savedUser = { ...user, _id: result.insertedId };
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    throw error;
  }

  const token = createAuthToken(savedUser._id.toString());
  setAuthCookie(res, token);

  return res.status(201).json({ user: sanitizeUser(savedUser) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash || '');
  if (!matches) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createAuthToken(user._id.toString());
  setAuthCookie(res, token);

  return res.json({ user: sanitizeUser(user) });
  })
);

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    return res.json({ user: sanitizeUser(req.user) });
  })
);

export default router;
