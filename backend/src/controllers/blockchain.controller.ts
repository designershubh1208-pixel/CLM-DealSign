import { Request, Response, NextFunction } from 'express';
import { blockchainService } from '../services/blockchain.service';
import { prisma } from '../config/database';

export class BlockchainController {

    /**
     * POST /api/blockchain/verify/:contractId
     * Verify contract on blockchain
     */
    async verifyContract(req: Request, res: Response, next: NextFunction) {
        try {
            const { contractId } = req.params;

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

            if (contract.isVerified) {
                return res.status(400).json({
                    success: false,
                    error: 'Contract already verified',
                    data: {
                        txHash: contract.txHash,
                        blockNumber: contract.blockNumber,
                        blockchainHash: contract.blockchainHash,
                    },
                });
            }

            // Calculate file hash
            const fileHash = blockchainService.calculateFileHash(contract.fileUrl);

            // Register on blockchain
            const result = await blockchainService.registerContract(fileHash, contractId);

            // Update database
            const updatedContract = await prisma.contract.update({
                where: { id: contractId },
                data: {
                    isVerified: true,
                    blockchainHash: fileHash,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    verifiedAt: new Date(),
                },
            });

            // Log activity
            await prisma.activity.create({
                data: {
                    contractId,
                    userId: (req as any).user.id,
                    type: 'VERIFIED',
                    description: `Contract verified on blockchain. Block: ${result.blockNumber}`,
                    metadata: {
                        txHash: result.txHash,
                        blockNumber: result.blockNumber,
                        hash: fileHash,
                    },
                },
            });

            return res.json({
                success: true,
                data: {
                    contractId,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber,
                    blockchainHash: fileHash,
                    verifiedAt: updatedContract.verifiedAt,
                },
                message: 'Contract verified on blockchain successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/blockchain/status/:contractId
     * Get verification status
     */
    async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { contractId } = req.params;

            const contract = await prisma.contract.findUnique({
                where: { id: contractId },
                select: {
                    id: true,
                    isVerified: true,
                    blockchainHash: true,
                    txHash: true,
                    blockNumber: true,
                    verifiedAt: true,
                },
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    error: 'Contract not found',
                });
            }

            // If verified, also check blockchain for latest data
            let blockchainData = null;
            if (contract.isVerified && contract.blockchainHash) {
                blockchainData = await blockchainService.verifyDocument(contract.blockchainHash);
            }

            return res.json({
                success: true,
                data: {
                    ...contract,
                    blockchainVerification: blockchainData,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/blockchain/check-hash
     * Check if hash exists on blockchain
     */
    async checkHash(req: Request, res: Response, next: NextFunction) {
        try {
            const { hash } = req.body;

            if (!hash) {
                return res.status(400).json({
                    success: false,
                    error: 'Hash is required',
                });
            }

            const result = await blockchainService.verifyDocument(hash);

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/blockchain/health
     * Check blockchain connection
     */
    async healthCheck(req: Request, res: Response, next: NextFunction) {
        try {
            const health = await blockchainService.healthCheck();

            return res.json({
                success: true,
                data: health,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const blockchainController = new BlockchainController();
