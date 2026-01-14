import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export const register = async (input: RegisterInput) => {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: 'VIEWER', // Default role
        },
    });

    // Generate tokens
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
};

export const login = async (input: LoginInput) => {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
};
