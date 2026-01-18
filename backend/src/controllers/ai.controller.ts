import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { prisma } from '../config/database';
import fs from 'fs';

export class AIController {

    /**
     * POST /api/ai/analyze/:contractId
     * Trigger full AI analysis
     */
    async analyzeContract(req: Request, res: Response, next: NextFunction) {
        try {
            const { contractId } = req.params;

            // Get contract from database
            const contract = await prisma.contract.findUnique({
                where: { id: contractId },
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    error: 'Contract not found',
                });
            }

            // Parse document to text
            const documentText = await aiService.parseDocument(contract.fileUrl);

            // Run full analysis
            const analysis = await aiService.analyzeContract(contractId, documentText.text);

            // Save results to database
            await prisma.$transaction([
                // Update contract with summary and risk score
                prisma.contract.update({
                    where: { id: contractId },
                    data: {
                        summary: analysis.summary,
                        riskScore: analysis.risk_score,
                    },
                }),

                // Delete existing clauses and risks
                prisma.clause.deleteMany({ where: { contractId } }),
                prisma.risk.deleteMany({ where: { contractId } }),

                // Insert new clauses
                prisma.clause.createMany({
                    data: analysis.clauses.map((c) => ({
                        contractId,
                        type: c.type as any,
                        text: c.text,
                        section: c.section,
                        riskLevel: c.riskLevel as any,
                    })),
                }),

                // Insert new risks
                prisma.risk.createMany({
                    data: analysis.risks.map((r) => ({
                        contractId,
                        severity: r.severity as any,
                        description: r.description,
                        recommendation: r.recommendation,
                        clauseReference: r.clauseReference,
                    })),
                }),

                // Log activity
                prisma.activity.create({
                    data: {
                        contractId,
                        userId: (req as any).user.id,
                        type: 'ANALYZED',
                        description: `AI analysis completed. Risk score: ${analysis.risk_score}`,
                    },
                }),
            ]);

            // Fetch updated contract with relations
            const updatedContract = await prisma.contract.findUnique({
                where: { id: contractId },
                include: {
                    clauses: true,
                    risks: true,
                },
            });

            return res.json({
                success: true,
                data: updatedContract,
                message: 'AI analysis completed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/ai/ask
     * Ask question about contract
     */
    async askQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const { contractId, question } = req.body;

            // Validate input
            if (!question || typeof question !== 'string' || question.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Question is required' });
            }

            // Get contract
            const contract = await prisma.contract.findUnique({
                where: { id: contractId },
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    error: 'Contract not found',
                });
            }

            // Parse document
            const documentText = await aiService.parseDocument(contract.fileUrl);

            if (!documentText || !documentText.text || documentText.text.trim().length < 20) {
                return res.status(422).json({ success: false, error: 'Contract text could not be parsed or is empty' });
            }

            // Get answer
            const result = await aiService.askQuestion(documentText.text, question);

            return res.json({
                success: true,
                data: {
                    question,
                    answer: result.answer,
                    confidence: result.confidence,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/ai/compare
     * Compare two contract versions and return AI-identified clause changes
     */
    async compareContracts(req: Request, res: Response, next: NextFunction) {
        try {
            const { contractAId, contractBId } = req.body;

            if (!contractAId || !contractBId) {
                return res.status(400).json({ success: false, error: 'Both contractAId and contractBId are required' });
            }

            // Fetch contracts
            const contractA = await prisma.contract.findUnique({ where: { id: contractAId } });
            const contractB = await prisma.contract.findUnique({ where: { id: contractBId } });

            if (!contractA || !contractB) {
                return res.status(404).json({ success: false, error: 'One or both contracts not found' });
            }

            // Parse both documents
            const docA = await aiService.parseDocument(contractA.fileUrl);
            const docB = await aiService.parseDocument(contractB.fileUrl);

            // Ask AI service to compare
            const compareResult = await aiService.compareContracts(docA.text, docB.text);

            return res.json({ success: true, data: compareResult });
        } catch (error) {
            next(error);
        }
    }
}

export const aiController = new AIController();
