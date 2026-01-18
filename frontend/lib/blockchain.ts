import { ethers } from "ethers";

// Fallback to a public RPC if window.ethereum is not available (for read-only)
const POLYGON_RPC = "https://polygon-rpc.com";

export class BlockchainService {
    private provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
    private signer: ethers.JsonRpcSigner | null = null;
    public walletAddress: string | null = null;

    constructor() {
        // Initialize with read-only provider initially
        this.provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    }

    // Connect to MetaMask
    async connectWallet(): Promise<string> {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error("MetaMask or compatible wallet not installed");
        }

        // Basic sanity checks: ensure the injected object looks like a wallet provider
        const eth = window.ethereum as any;
        if (!(typeof eth === 'object' && (typeof eth.request === 'function' || typeof eth.send === 'function'))) {
            throw new Error('No compatible wallet provider found');
        }

        try {
            // Request account access using provider API if available; fall back to legacy send
            if (typeof eth.request === 'function') {
                const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
                this.provider = new ethers.BrowserProvider(eth);
                this.signer = await this.provider.getSigner();
                this.walletAddress = accounts && accounts[0];
            } else {
                // Legacy providers may expose send
                this.provider = new ethers.BrowserProvider(eth);
                const accounts: any = await this.provider.send('eth_requestAccounts', []);
                this.signer = await this.provider.getSigner();
                this.walletAddress = accounts && accounts[0];
            }

            if (!this.walletAddress) throw new Error('No account found');
            return this.walletAddress;
        } catch (error: any) {
            // Handle user rejection (EIP-1193 code 4001) gracefully without noisy console errors.
            const msg = error?.message ?? '';
            const code = error?.code;
            if (code === 4001 || /user rejected/i.test(msg) || /user denied/i.test(msg)) {
                // Do not log the full extension error stack; return a concise error.
                throw new Error('User rejected the wallet connection');
            }

            // For other errors, log a brief message and throw a generic error.
            console.error('Failed to connect wallet:', msg || error);
            throw new Error('Failed to connect wallet');
        }
    }

    // Calculate file hash (SHA-256)
    async calculateHash(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return `0x${hashHex}`;
    }

    // Simulate verifying a hash on the blockchain (Mock implementation)
    async verifyDocument(hash: string, contractId: string): Promise<{ txHash: string; blockNumber: number, timestamp: number }> {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        // verify we have a signer
        if (!this.signer) {
            // Auto-connect for demo purposes if not connected? 
            // For now, assume connected or throw
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    await this.connectWallet();
                } catch (err) {
                    console.warn('Wallet connect failed during verification, simulating verification instead');
                }
            } else {
                // For demo/mock without wallet, return a dummy success
                console.warn('No wallet found, simulating verification');
            }
        }

        // In a real app, this would call a smart contract: contract.registerDocument(hash, contractId)
        // For this frontend demo, we return a mock transaction receipt
        return {
            txHash: ethers.hexlify(ethers.randomBytes(32)),
            blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
            timestamp: Math.floor(Date.now() / 1000)
        };
    }

    // Mock check if hash exists on chain
    async checkHash(hash: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock logic: return true for demo, or based on specific mock hashes
        return true;
    }

    // Get current network
    async getNetwork(): Promise<string> {
        const network = await this.provider.getNetwork();
        return network.name;
    }
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const blockchainService = new BlockchainService();
