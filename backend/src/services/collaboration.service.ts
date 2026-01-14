import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { ApprovalStatus } from '@prisma/client';

// Comments
export const getComments = async (contractId: string) => {
    return prisma.comment.findMany({
        where: { contractId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const addComment = async (contractId: string, userId: string, content: string) => {
    return prisma.$transaction([
        prisma.comment.create({
            data: { contractId, userId, content }
        }),
        prisma.activity.create({
            data: {
                type: 'COMMENTED',
                description: 'Added a comment',
                contractId,
                userId
            }
        })
    ]);
};

export const deleteComment = async (commentId: string, userId: string, userRole: string) => {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new AppError('Comment not found', 404);

    if (comment.userId !== userId && userRole !== 'ADMIN') {
        throw new AppError('Not authorized to delete this comment', 403);
    }

    return prisma.comment.delete({ where: { id: commentId } });
};

// Approvals
export const getApprovals = async (contractId: string) => {
    return prisma.approval.findMany({
        where: { contractId },
        include: { user: { select: { id: true, name: true, avatar: true } } }
    });
};

export const updateApproval = async (approvalId: string, userId: string, status: ApprovalStatus, comment?: string) => {
    const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new AppError('Approval request not found', 404);

    if (approval.userId !== userId) {
        throw new AppError('Not authorized to update this approval', 403);
    }

    const updatedApproval = await prisma.approval.update({
        where: { id: approvalId },
        data: { status, comment, decidedAt: new Date() }
    });

    // Log activity
    await prisma.activity.create({
        data: {
            type: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
            description: `Contract ${status.toLowerCase()} by ${approval.role}`,
            contractId: approval.contractId,
            userId
        }
    });

    // Check if all approvals are done to update contract status? 
    // Simplified: Just update contract status if this is final approval
    if (status === 'APPROVED') {
        await prisma.contract.update({
            where: { id: approval.contractId },
            data: { status: 'APPROVED' }
        });
    } else if (status === 'REJECTED') {
        await prisma.contract.update({
            where: { id: approval.contractId },
            data: { status: 'REJECTED' }
        });
    }

    return updatedApproval;
};

export const requestApproval = async (contractId: string, userId: string, role: 'LEGAL' | 'MANAGER') => {
    // Usually admin/owner requests approval FROM someone else
    // For demo, we might just create a pending approval assigned to "userId" but typically we'd assign to a specific user
    // Simplified: Assign to self or a placeholder user for demo

    return prisma.approval.create({
        data: {
            contractId,
            userId, // Assigning to self for demo simplicity
            role,
            status: 'PENDING'
        }
    });
};

// Activities
export const getActivities = async (contractId: string) => {
    return prisma.activity.findMany({
        where: { contractId },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
