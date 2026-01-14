import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Timeout 60 seconds for AI processing
const axiosInstance = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 60000,
});

export interface AnalysisResult {
    summary: string;
    risk_score: number;
    clauses: Array<{
        type: string;
        text: string;
        section: string;
        riskLevel: string;
    }>;
    risks: Array<{
        severity: string;
        description: string;
        recommendation: string;
        clauseReference?: string;
    }>;
}

export interface QAResult {
    answer: string;
    confidence: number;
}

export class AIService {

    /**
     * Full contract analysis - summary, clauses, risks
     */
    async analyzeContract(contractId: string, text: string): Promise<AnalysisResult> {
        try {
            const response = await axiosInstance.post('/analyze', {
                contract_id: contractId,
                text: text,
            });
            return response.data;
        } catch (error: any) {
            console.error('AI Analysis failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Generate summary only
     */
    async summarize(text: string): Promise<string> {
        try {
            const response = await axiosInstance.post('/summarize', { text });
            return response.data.summary;
        } catch (error: any) {
            console.error('Summarization failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Extract clauses from contract
     */
    async extractClauses(text: string): Promise<AnalysisResult['clauses']> {
        try {
            const response = await axiosInstance.post('/extract-clauses', { text });
            return response.data.clauses;
        } catch (error: any) {
            console.error('Clause extraction failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Detect risks in contract
     */
    async detectRisks(text: string): Promise<{ risks: AnalysisResult['risks']; risk_score: number }> {
        try {
            const response = await axiosInstance.post('/detect-risks', { text });
            return {
                risks: response.data.risks,
                risk_score: response.data.risk_score,
            };
        } catch (error: any) {
            console.error('Risk detection failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Q&A about contract
     */
    async askQuestion(text: string, question: string): Promise<QAResult> {
        try {
            const response = await axiosInstance.post('/ask', {
                text: text,
                question: question,
            });
            return response.data;
        } catch (error: any) {
            console.error('Q&A failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Parse PDF/DOCX file to text
     */
    async parseDocument(filePath: string): Promise<{ text: string; pages: number; filename: string }> {
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const response = await axiosInstance.post('/parse-document', formData, {
                headers: formData.getHeaders(),
            });
            return response.data;
        } catch (error: any) {
            console.error('Document parsing failed:', error.message);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axiosInstance.get('/health');
            return response.data.status === 'healthy';
        } catch {
            return false;
        }
    }
}

// Singleton export
export const aiService = new AIService();
