import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { getJwtSecret } from '../utils/jwtSecret';

// Extend the Request type to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Or a more specific user type
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded: any = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select('-password') as IUser;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const optionalProtect = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded: any = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select('-password') as IUser;
  } catch {
    // Public routes stay public when the token is missing or invalid.
  }

  return next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assuming req.user.role exists (e.g., 'admin', 'user')
    // For now, we only have isAdmin. We can extend this later if needed.
    // If the user has an 'isAdmin' property and it's true, we can treat them as an 'admin' role.
    if (!req.user || (roles.includes('admin') && !req.user.isAdmin)) {
      return res.status(403).json({ message: 'Not authorized to access this route' });
    }
    next();
  };
};