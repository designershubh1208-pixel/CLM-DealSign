import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { ContractType, Prisma } from '@prisma/client';

export const findAll = async (
    page: number,
    limit: number,
    filters: { status?: string; type?: string; search?: string }
) => {
    const skip = (page - 1) * limit;

    const where: Prisma.ContractWhereInput = {};

    if (filters.status) {
        where.status = filters.status as any;
    }
    if (filters.type) {
        where.type = filters.type as any;
    }
    if (filters.search) {
        where.title = { contains: filters.search, mode: 'insensitive' };
    }

    const [contracts, total] = await Promise.all([
        prisma.contract.findMany({
            where,
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
                uploadedBy: { select: { name: true, email: true } },
            },
        }),
        prisma.contract.count({ where }),
    ]);

    return { contracts, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id: string) => {
    const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
            clauses: true,
            risks: true,
            comments: { include: { user: { select: { name: true, avatar: true } } } },
            approvals: { include: { user: { select: { name: true, avatar: true } } } },
            activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
            uploadedBy: { select: { name: true, email: true } },
        },
    });

    if (!contract) {
        throw new AppError('Contract not found', 404);
    }

    return contract;
};

export const create = async (
    userId: string,
    file: Express.Multer.File,
    data: {
        title: string;
        type: ContractType;
        parties: string[];
        effectiveDate?: string;
        expiryDate?: string
    }
) => {
    // Simulate file upload URL (in real app, upload to S3/Cloudinary)
    const fileUrl = `/uploads/${userId}/${file.filename}`;

    return prisma.contract.create({
        data: {
            title: data.title,
            type: data.type,
            status: 'DRAFT',
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            parties: data.parties,
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            uploadedById: userId,
            activities: {
                create: {
                    type: 'UPLOADED',
                    description: `Contract uploaded by user`,
                    userId,
                }
            }
        },
    });
};

export const update = async (id: string, data: any, userId: string) => {
    await findById(id);

    return prisma.contract.update({
        where: { id },
        data: {
            ...data,
            activities: {
                create: {
                    type: 'UPLOADED', // Using closest type broadly for update, or add UPDATED type
                    description: 'Contract details updated',
                    userId
                }
            }
        },
    });
};

export const remove = async (id: string) => {
    await findById(id);
    return prisma.contract.delete({ where: { id } });
};

export const getStats = async () => {
    const [total, pending, highRisk, verified] = await Promise.all([
        prisma.contract.count(),
        prisma.contract.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.risk.count({ where: { severity: 'HIGH' } }), // Approximation
        prisma.contract.count({ where: { isVerified: true } }),
    ]);

    return { total, pending, highRisk, verified };
};
