import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signAccessToken = (payload: object) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

export const signRefreshToken = (payload: object) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, env.JWT_SECRET);
};
