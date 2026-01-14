import { Request, Response, NextFunction } from 'express';
import * as contractService from '../services/contract.service';
import { AppError } from '../utils/errors';
import { ContractType } from '@prisma/client';

export const getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filters = {
            status: req.query.status as string,
            type: req.query.type as string,
            search: req.query.search as string
        };

        const result = await contractService.findAll(page, limit, filters);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contract = await contractService.findById(req.params.id);
        res.status(200).json({ success: true, data: contract });
    } catch (error) {
        next(error);
    }
};

export const uploadContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }
        if (!req.user) throw new AppError('Not authenticated', 401);

        const { title, type, parties, effectiveDate, expiryDate } = req.body;

        // Parties are validated/transformed in Validator but might come as string here if not using validator middleware correctly for multipart
        // The validator middleware parses body BEFORE Multer if placed incorrectly, but Multer needs to run first to parse body.
        // For this specific route, we usually validate manually or use a specialized approach.
        // Assuming simple parsing here for safety:
        let parsedParties: string[] = [];
        try {
            parsedParties = JSON.parse(parties);
        } catch {
            parsedParties = [parties];
        }

        const contract = await contractService.create(req.user.id, req.file, {
            title,
            type: type as ContractType,
            parties: parsedParties,
            effectiveDate,
            expiryDate
        });

        res.status(201).json({ success: true, data: contract });
    } catch (error) {
        next(error);
    }
};

export const updateContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError('Not authenticated', 401);
        const contract = await contractService.update(req.params.id, req.body, req.user.id);
        res.status(200).json({ success: true, data: contract });
    } catch (error) {
        next(error);
    }
};

export const deleteContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await contractService.remove(req.params.id);
        res.status(204).json({ success: true, data: null });
    } catch (error) {
        next(error);
    }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await contractService.getStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
