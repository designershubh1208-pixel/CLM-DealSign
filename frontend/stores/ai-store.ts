import { create } from 'zustand';
import { AIAnalysis, ChatMessage } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

interface AIStore {
    analysis: AIAnalysis | null;
    isAnalyzing: boolean;
    chatHistory: ChatMessage[];
    isChatLoading: boolean;

    // Actions
    analyzeContract: (contractId: string) => Promise<void>;
    askQuestion: (contractId: string, question: string) => Promise<void>;
    clearAnalysis: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
    analysis: null,
    isAnalyzing: false,
    chatHistory: [],
    isChatLoading: false,

    analyzeContract: async (contractId: string) => {
        set({ isAnalyzing: true, analysis: null });
        try {
            const analysis = await api.ai.analyze(contractId);
            set({ analysis, isAnalyzing: false });
            toast.success('AI Analysis complete');
        } catch (error) {
            console.error('AI Analysis failed:', error);
            set({ isAnalyzing: false });
            toast.error('AI Analysis failed. Please try again.');
        }
    },

    askQuestion: async (contractId: string, question: string) => {
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: question,
            timestamp: new Date().toISOString()
        };

        set(state => ({
            chatHistory: [...state.chatHistory, userMessage],
            isChatLoading: true
        }));

        try {
            const response = await api.ai.chat(contractId, question);

            const aiMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            set(state => ({
                chatHistory: [...state.chatHistory, aiMessage],
                isChatLoading: false
            }));
        } catch (error) {
            console.error('Failed to get AI response:', error);
            set({ isChatLoading: false });
            const msg = error instanceof Error ? error.message : 'Failed to get answer';
            toast.error(msg);
        }
    },

    clearAnalysis: () => set({ analysis: null, chatHistory: [] }),
}));
