import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';

interface JwtPayload {
    id: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

            // Check if user still exists
            const currentUser = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, role: true } // Minimal selection
            });

            if (!currentUser) {
                return next(
                    new AppError('The user belonging to this token does no longer exist.', 401)
                );
            }

            // Grant access
            req.user = { id: currentUser.id, role: currentUser.role };
            next();
        } catch (err) {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};
