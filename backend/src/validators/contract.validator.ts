import { z } from 'zod';

export const createContractSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        type: z.enum(['NDA', 'MSA', 'SLA', 'SOW', 'EMPLOYMENT', 'OTHER']),
        parties: z.string().transform((val) => {
            try {
                return JSON.parse(val); // Parties come as JSON string from multipart form
            } catch {
                return [val];
            }
        }).pipe(z.array(z.string()).min(2, 'At least 2 parties required')),
        effectiveDate: z.string().optional(),
        expiryDate: z.string().optional(),
    }),
});

export const updateContractSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
        riskScore: z.number().min(0).max(100).optional(),
        isVerified: z.boolean().optional(),
        blockchainHash: z.string().optional(),
    }),
});
