import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

export const findAll = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
        },
    });
};

export const findById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

export const update = async (id: string, data: { name?: string; avatar?: string; role?: 'ADMIN' | 'LEGAL' | 'MANAGER' | 'VIEWER' }) => {
    // Check if user exists
    await findById(id);

    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            updatedAt: true,
        },
    });
};

export const remove = async (id: string) => {
    await findById(id);
    return prisma.user.delete({ where: { id } });
};
