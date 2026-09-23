// api/_handlers/lib/auth.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export interface AuthUser {
  uid: string;
  email: string;
  role: string;
}

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
};

export const withAuth = (handler: Function) => async (req: VercelRequest, res: VercelResponse) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = verifyToken(token);
    (req as any).user = user;
    return handler(req, res);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const withRole = (roles: string[]) => (handler: Function) => async (req: VercelRequest, res: VercelResponse) => {
  return withAuth(async (req: any, res: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    return handler(req, res);
  })(req, res);
};
