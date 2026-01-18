import { create } from 'zustand';
import { Contract, ContractStatus, ContractMetadata } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ContractStore {
    contracts: Contract[];
    selectedContract: Contract | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchContracts: () => Promise<void>;
    fetchContractById: (id: string) => Promise<void>;
    uploadContract: (file: File, metadata: ContractMetadata) => Promise<void>;
    updateContractStatus: (id: string, status: ContractStatus) => Promise<void>;
    setSelectedContract: (contract: Contract | null) => void;
}

export const useContractStore = create<ContractStore>((set, get) => ({
    contracts: [],
    selectedContract: null,
    isLoading: false,
    error: null,

    fetchContracts: async () => {
        set({ isLoading: true, error: null });
        try {
            const contracts = await api.contracts.list();
            set({ contracts, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
            set({ error: 'Failed to fetch contracts', isLoading: false });
            toast.error('Failed to load contracts');
        }
    },

    fetchContractById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const contract = await api.contracts.get(id);
            set({ selectedContract: contract, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch contract:', error);
            set({ error: 'Failed to fetch contract details', isLoading: false });
            toast.error('Failed to load contract details');
        }
    },

    deleteContract: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            // Optimistic removal
            const prev = get().contracts;
            set({ contracts: prev.filter(c => c.id !== id) });

            await api.contracts.delete(id);
            toast.success('Contract deleted');
            set({ isLoading: false });
        } catch (error) {
            console.error('Failed to delete contract:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to delete contract', isLoading: false });
            toast.error('Failed to delete contract');
            // Re-fetch to restore state
            get().fetchContracts();
        }
    },

    uploadContract: async (file: File, metadata: ContractMetadata) => {
        set({ isLoading: true, error: null });
        try {
            const newContract = await api.contracts.upload(file, metadata);
            const contracts = get().contracts;
            set({ contracts: [newContract, ...contracts], isLoading: false });
            toast.success('Contract uploaded successfully');

            // Auto-select the new contract
            set({ selectedContract: newContract });
        } catch (error) {
            console.error('Failed to upload contract:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload contract';
            set({ error: errorMessage, isLoading: false });

            // Show more specific error messages
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                toast.error('Authentication failed. Please log in again.');
            } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
                toast.error('Invalid file or metadata. Please check your input.');
            } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                toast.error('Cannot connect to server. Please check if the backend is running.');
            } else {
                toast.error(`Upload failed: ${errorMessage}`);
            }
            throw error;
        }
    },

    updateContractStatus: async (id: string, status: ContractStatus) => {
        try {
            // Optimistic update
            const contracts = get().contracts.map(c =>
                c.id === id ? { ...c, status } : c
            );
            const selectedContract = get().selectedContract;

            set({
                contracts,
                selectedContract: selectedContract?.id === id ? { ...selectedContract, status } : selectedContract
            });

            await api.contracts.update(id, { status });
            toast.success(`Contract status updated to ${status}`);
        } catch (error) {
            // Avoid noisy console.error for expected validation/network errors.
            const message = error instanceof Error ? error.message : 'Failed to update status';
            set({ error: message });
            toast.error(message.includes('400') || message.toLowerCase().includes('validation') ? 'Invalid status update. Check inputs.' : 'Failed to update status');
            // Keep optimistic UI so dashboard updates quickly; do not immediately refetch here.
        }
    },

    setSelectedContract: (contract) => set({ selectedContract: contract }),
}));
