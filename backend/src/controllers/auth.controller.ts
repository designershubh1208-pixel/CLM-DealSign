import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, accessToken, refreshToken } = await authService.register(req.body);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            success: true,
            data: { user, accessToken },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, accessToken, refreshToken } = await authService.login(req.body);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            data: { user, accessToken },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    // Refresh logic to be implemented if needed, currently client re-logs in or uses stored refresh token if implemented
    res.status(501).json({ message: "Not implemented yet" })
};
