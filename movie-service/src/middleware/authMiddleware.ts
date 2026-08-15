import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';

    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
        return;
      }
      req.user = decoded as { id: string; role: string };
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: Missing token.' });
  }
};
