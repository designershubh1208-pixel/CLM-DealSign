import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load contract ABI
const CONTRACT_ABI = [
    "function registerContract(bytes32 documentHash, string contractId) external",
    "function logApproval(bytes32 documentHash, string role, string comment) external",
    "function verifyDocument(bytes32 documentHash) external view returns (bool exists, address registeredBy, uint256 timestamp)",
    "function getApprovals(bytes32 documentHash) external view returns (tuple(address approver, string role, uint256 timestamp, string comment)[])",
    "function getAuditLog(bytes32 documentHash) external view returns (string[])",
    "event ContractRegistered(bytes32 indexed documentHash, address indexed registeredBy, uint256 timestamp, string contractId)",
    "event ApprovalLogged(bytes32 indexed documentHash, address indexed approver, string role, uint256 timestamp)"
];

export interface VerificationResult {
    exists: boolean;
    registeredBy: string;
    timestamp: number;
}

export interface ApprovalRecord {
    approver: string;
    role: string;
    timestamp: number;
    comment: string;
}

export interface TransactionResult {
    txHash: string;
    blockNumber: number;
    timestamp: number;
}

export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Signer;
    private contract: ethers.Contract;
    private isConnected: boolean = false;

    constructor() {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        const privateKey = process.env.PRIVATE_KEY;
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (!privateKey || !contractAddress) {
            console.warn('Blockchain not configured: Missing PRIVATE_KEY or CONTRACT_ADDRESS');
            // Initialize with dummy data to avoid crash if env vars missing during dev
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = ethers.Wallet.createRandom(this.provider);
            this.contract = new ethers.Contract(ethers.ZeroAddress, CONTRACT_ABI, this.wallet);
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);
            this.isConnected = true;
            console.log('✅ Blockchain connected:', contractAddress);
        } catch (error) {
            console.error('❌ Blockchain connection failed:', error);
            // Fallback dummy
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = ethers.Wallet.createRandom(this.provider);
            this.contract = new ethers.Contract(ethers.ZeroAddress, CONTRACT_ABI, this.wallet);
        }
    }

    /**
     * Calculate SHA-256 hash of file
     */
    calculateFileHash(filePath: string): string {
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        return '0x' + hash;
    }

    /**
     * Calculate hash from buffer
     */
    calculateBufferHash(buffer: Buffer): string {
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        return '0x' + hash;
    }

    /**
     * Register contract hash on blockchain
     */
    async registerContract(documentHash: string, contractId: string): Promise<TransactionResult> {
        if (!this.isConnected) {
            throw new Error('Blockchain not connected');
        }

        try {
            // Ensure hash is bytes32 format
            const hashBytes32 = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;

            console.log(`📝 Registering contract: ${contractId} with hash: ${hashBytes32}`);

            const tx = await (this.contract as any).registerContract(hashBytes32, contractId);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                timestamp: Date.now(),
            };
        } catch (error: any) {
            console.error('❌ Registration failed:', error.message);

            // Check if already registered
            if (error.message && error.message.includes('already registered')) {
                throw new Error('Contract already registered on blockchain');
            }
            throw new Error(`Blockchain Error: ${error.message}`);
        }
    }

    /**
     * Verify if document hash exists on blockchain
     */
    async verifyDocument(documentHash: string): Promise<VerificationResult> {
        if (!this.isConnected) {
            throw new Error('Blockchain not connected');
        }

        try {
            const hashBytes32 = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;

            const [exists, registeredBy, timestamp] = await (this.contract as any).verifyDocument(hashBytes32);

            return {
                exists,
                registeredBy,
                timestamp: Number(timestamp) * 1000, // Convert to milliseconds
            };
        } catch (error: any) {
            console.error('❌ Verification failed:', error.message);
            throw new Error(`Blockchain Error: ${error.message}`);
        }
    }

    /**
     * Log approval on blockchain
     */
    async logApproval(documentHash: string, role: string, comment: string): Promise<TransactionResult> {
        if (!this.isConnected) {
            throw new Error('Blockchain not connected');
        }

        try {
            const hashBytes32 = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;

            console.log(`📝 Logging approval: ${role} for hash: ${hashBytes32}`);

            const tx = await (this.contract as any).logApproval(hashBytes32, role, comment);
            const receipt = await tx.wait();

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                timestamp: Date.now(),
            };
        } catch (error: any) {
            console.error('❌ Approval logging failed:', error.message);
            if (error.message && error.message.includes('Contract not found')) {
                throw new Error('Contract not registered on blockchain');
            }
            throw new Error(`Blockchain Error: ${error.message}`);
        }
    }

    /**
     * Get all approvals for a document
     */
    async getApprovals(documentHash: string): Promise<ApprovalRecord[]> {
        if (!this.isConnected) {
            throw new Error('Blockchain not connected');
        }

        try {
            const hashBytes32 = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;

            const approvals = await (this.contract as any).getApprovals(hashBytes32);

            return approvals.map((a: any) => ({
                approver: a.approver,
                role: a.role,
                timestamp: Number(a.timestamp) * 1000,
                comment: a.comment,
            }));
        } catch (error: any) {
            console.error('❌ Get approvals failed:', error.message);
            throw new Error(`Blockchain Error: ${error.message}`);
        }
    }

    /**
     * Get audit log for a document
     */
    async getAuditLog(documentHash: string): Promise<string[]> {
        if (!this.isConnected) {
            throw new Error('Blockchain not connected');
        }

        try {
            const hashBytes32 = documentHash.startsWith('0x') ? documentHash : '0x' + documentHash;
            return await (this.contract as any).getAuditLog(hashBytes32);
        } catch (error: any) {
            console.error('❌ Get audit log failed:', error.message);
            throw new Error(`Blockchain Error: ${error.message}`);
        }
    }

    /**
     * Check if blockchain is connected
     */
    async healthCheck(): Promise<{ connected: boolean; network?: string; blockNumber?: number }> {
        if (!this.isConnected) {
            return { connected: false };
        }

        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();

            return {
                connected: true,
                network: this.getNetworkName(network.chainId), // Use helper, network.name can be 'unknown'
                blockNumber,
            };
        } catch {
            return { connected: false };
        }
    }

    private getNetworkName(chainId: bigint): string {
        if (chainId === 1337n) return 'localhost';
        if (chainId === 11155111n) return 'sepolia';
        return 'unknown';
    }
}

// Singleton export
export const blockchainService = new BlockchainService();
