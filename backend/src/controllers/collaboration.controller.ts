import { Request, Response, NextFunction } from 'express';
import * as collabService from '../services/collaboration.service';
import { AppError } from '../utils/errors';
import { ApprovalStatus } from '@prisma/client';

// Comments
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await collabService.getComments(req.params.contractId);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('Not authenticated', 401);
        const result = await collabService.addComment(req.params.contractId, req.user.id, req.body.content);
        res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('Not authenticated', 401);
        await collabService.deleteComment(req.params.commentId, req.user.id, req.user.role);
        res.status(204).json({ success: true, data: null });
    } catch (error) { next(error); }
};

// Approvals
export const getApprovals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await collabService.getApprovals(req.params.contractId);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const requestApproval = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('Not authenticated', 401);
        const result = await collabService.requestApproval(req.params.contractId, req.user.id, req.body.role);
        res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const updateApproval = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('Not authenticated', 401);
        const { status, comment } = req.body;
        const result = await collabService.updateApproval(req.params.approvalId, req.user.id, status as ApprovalStatus, comment);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};

// Activities
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await collabService.getActivities(req.params.contractId);
        res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
};
