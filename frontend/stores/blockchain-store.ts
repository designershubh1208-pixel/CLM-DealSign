import { create } from 'zustand';
import { blockchainService } from '@/lib/blockchain';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BlockchainStore {
    isConnected: boolean;
    walletAddress: string | null;
    network: string | null;
    isVerifying: boolean;

    // Actions
    connectWallet: () => Promise<void>;
    verifyContractOnChain: (contractId: string, hash: string) => Promise<void>;
    checkConnection: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainStore>((set, get) => ({
    isConnected: false,
    walletAddress: null,
    network: null,
    isVerifying: false,

    connectWallet: async () => {
        try {
            const address = await blockchainService.connectWallet();
            const network = await blockchainService.getNetwork();
            set({ isConnected: true, walletAddress: address, network });
            toast.success('Wallet connected successfully');
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            toast.error('Failed to connect wallet');
        }
    },

    checkConnection: async () => {
        // Check if previously connected (simplified)
        if (typeof window !== 'undefined' && window.ethereum && window.ethereum.selectedAddress) {
            // We could auto-reconnect here
            // await get().connectWallet();
        }
    },

    verifyContractOnChain: async (contractId: string, hash: string) => {
        set({ isVerifying: true });
        try {
            // 1. Ensure wallet connected
            if (!get().isConnected) {
                await get().connectWallet();
            }

            // 2. Call blockchain service
            await api.blockchain.verify(contractId, hash);

            // 3. In real app, we would update the contract record in DB with the txHash
            // Here we just notify

            set({ isVerifying: false });
        } catch (error) {
            console.error('Verification failed:', error);
            set({ isVerifying: false });
            toast.error('Blockchain verification failed');
            throw error;
        }
    }
}));
