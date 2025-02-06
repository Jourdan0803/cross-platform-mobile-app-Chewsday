import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};