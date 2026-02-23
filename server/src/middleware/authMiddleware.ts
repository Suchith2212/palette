import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Extend the Request type to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Or a more specific user type
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Attach user from the token to the request (excluding password)
      req.user = await User.findById(decoded.id).select('-password') as IUser;

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
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