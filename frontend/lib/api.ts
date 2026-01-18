import { Contract, AIAnalysis, BlockchainVerification, DashboardStats } from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:5000/api";
const AI_URL = (process.env.NEXT_PUBLIC_AI_URL as string) || "http://localhost:8000";

const getHeaders = () => {
    const token = localStorage.getItem('deal_sign_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem('deal_sign_token');
        }
        // Try to parse JSON error body, but be resilient to different shapes
        const errorBody = await res.json().catch(() => null);
        let message = res.statusText || `HTTP ${res.status}`;
        if (errorBody) {
            if (typeof errorBody === 'string') {
                message = errorBody;
            } else if (typeof errorBody === 'object') {
                // Common fields: message, error, errors
                // If validation errors exist, stringify them
                if ((errorBody as any).message) message = (errorBody as any).message;
                else if ((errorBody as any).error) message = (errorBody as any).error;
                else if ((errorBody as any).errors) message = JSON.stringify((errorBody as any).errors);
                else message = JSON.stringify(errorBody);
            }
        }
        throw new Error(message);
    }
    return res.json();
};

// Network-safe fetch wrapper to produce clearer errors for network/CORS failures
const safeFetch = async (input: RequestInfo, init?: RequestInit) => {
    try {
        const res = await fetch(input, init);
        return await handleResponse(res);
    } catch (err: unknown) {
        // Narrow unknown to provide helpful message
        if (err instanceof Error) {
            // Common fetch failures show as TypeError: Failed to fetch
            if (err.message === 'Failed to fetch') {
                throw new Error(`Network error: Unable to reach backend at ${API_URL}. Ensure backend is running and CORS allows requests.`);
            }
            throw err;
        }
        throw new Error(`Network error: Unable to reach backend at ${API_URL}`);
    }
};

export const api = {
    contracts: {
        list: async (): Promise<Contract[]> => {
            const json = await safeFetch(`${API_URL}/contracts`, { headers: getHeaders() });
            return json.data.contracts; // Backend returns { success: true, data: { contracts: [], ... } }
        },
        get: async (id: string): Promise<Contract | null> => {
            const json = await safeFetch(`${API_URL}/contracts/${id}`, { headers: getHeaders() });
            return json.data;
        },
        upload: async (file: File, metadata: any): Promise<Contract> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', metadata.title);
            formData.append('type', metadata.type);
            formData.append('parties', JSON.stringify(metadata.parties));
            // Add other fields if needed

            const token = localStorage.getItem('deal_sign_token');

            console.log('Upload attempt:', {
                url: `${API_URL}/contracts/upload`,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                hasToken: !!token,
                metadata
            });

            try {
                // For FormData uploads we must not set Content-Type header
                const res = await fetch(`${API_URL}/contracts/upload`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
                    body: formData
                });
                const json = await handleResponse(res);
                return json.data;
            } catch (error) {
                console.error('Upload error details:', {
                    error,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                });
                throw error;
            }
        },
        update: async (id: string, updates: Partial<Contract>): Promise<Contract> => {
            // Use a tolerant fetch: some backends may return non-2xx status with useful body
            const res = await fetch(`${API_URL}/contracts/${id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });

            const body = await res.json().catch(() => null);

            if (res.ok) {
                return body?.data;
            }

            // If backend returned a non-OK status but included the updated contract in body.data, tolerate it.
            if (body && typeof body === 'object' && (body as any).data) {
                return (body as any).data;
            }

            // Otherwise, build a helpful error message and throw
            let message = res.statusText || `HTTP ${res.status}`;
            if (body) {
                if (typeof body === 'string') message = body;
                else if ((body as any).message) message = (body as any).message;
                else if ((body as any).error) message = (body as any).error;
                else if ((body as any).errors) message = JSON.stringify((body as any).errors);
                else message = JSON.stringify(body);
            }
            throw new Error(`${res.status} ${message}`);
        }
        ,
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_URL}/contracts/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            // 204 No Content is expected, but accept other shapes
            if (res.ok) return;

            const body = await res.json().catch(() => null);
            let message = res.statusText || `HTTP ${res.status}`;
            if (body) {
                if (typeof body === 'string') message = body;
                else if ((body as any).message) message = (body as any).message;
                else message = JSON.stringify(body);
            }
            throw new Error(`${res.status} ${message}`);
        }
    },
    ai: {
        analyze: async (contractId: string): Promise<AIAnalysis> => {
            const json = await safeFetch(`${API_URL}/ai/analyze/${contractId}`, { method: 'POST', headers: getHeaders() });
            return json.data;
        },
        chat: async (contractId: string, message: string): Promise<string> => {
            try {
                const json = await safeFetch(`${API_URL}/ai/ask`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ contractId, question: message })
                });
                return json.data.answer;
            } catch (err: unknown) {
                // If backend couldn't parse contract text, return a helpful assistant message
                const msg = err instanceof Error ? err.message : String(err);
                if (msg && msg.toLowerCase().includes('contract text could not be parsed')) {
                    return 'I cannot read the contract text for this file. Try running AI analysis on the contract (Analyze) or re-upload the file so I can answer questions.';
                }
                // For network or other errors, bubble up so UI can show toast
                throw err;
            }
        }
        ,
        compare: async (contractAId: string, contractBId: string): Promise<any> => {
            // Best-effort frontend-side compare using the AI service endpoints.
            // Steps:
            // 1. Load contract metadata from backend
            // 2. Fetch the contract file text (with auth if available)
            // 3. Send each text to AI service /analyze to extract clauses
            // 4. Perform a simple clause-level diff and return a structured result

            if (!contractAId || !contractBId) throw new Error('Both contract IDs are required');

            // Helper to get contract metadata from backend
            const getContractMeta = async (id: string) => {
                const json = await safeFetch(`${API_URL}/contracts/${id}`, { headers: getHeaders() });
                return json.data;
            };

            const fetchTextFromFileUrl = async (fileUrl?: string) => {
                if (!fileUrl) return '';
                const apiBase = (API_URL as string).replace(/\/api\/?$/, '');
                const abs = fileUrl.startsWith('http') ? fileUrl : (fileUrl.startsWith('/') ? `${apiBase}${fileUrl}` : `${apiBase}/${fileUrl}`);
                try {
                    const token = localStorage.getItem('deal_sign_token');
                    const headers: Record<string, string> = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                    const res = await fetch(abs, { headers });
                    if (!res.ok) return '';
                    return await res.text();
                } catch {
                    return '';
                }
            };

            try {
                const [metaA, metaB] = await Promise.all([
                    getContractMeta(contractAId),
                    getContractMeta(contractBId)
                ]);

                const [textA, textB] = await Promise.all([
                    // Prefer stored content, fall back to fetching file
                    (metaA?.content as string) || fetchTextFromFileUrl(metaA?.fileUrl),
                    (metaB?.content as string) || fetchTextFromFileUrl(metaB?.fileUrl)
                ]);

                // Call AI service analyze endpoints for both texts (best-effort)
                const analyze = async (text: string) => {
                    if (!text) return null;
                    const res = await fetch(`${AI_URL}/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text })
                    });
                    return await handleResponse(res).catch(() => null);
                };

                const [aAnalysis, bAnalysis] = await Promise.all([analyze(textA), analyze(textB)]);

                // Build simple clause-level diff: match clauses by section/title and compare text
                const clausesA = (aAnalysis && aAnalysis.clauses) || [];
                const clausesB = (bAnalysis && bAnalysis.clauses) || [];

                const changes: any[] = [];

                const byKey = (c: any) => (c.section || c.title || c.id || c.hash || c.summary || c.text || '').toString();

                const mapB = new Map<string, any>();
                clausesB.forEach((c: any) => mapB.set(byKey(c), c));

                // detect removed/modified
                for (const a of clausesA) {
                    const key = byKey(a);
                    const b = mapB.get(key);
                    if (!b) {
                        changes.push({ type: 'removed', clause: key, original: a.text || a.summary || '' });
                    } else if ((a.text || a.summary || '') !== (b.text || b.summary || '')) {
                        changes.push({ type: 'modified', clause: key, original: a.text || a.summary || '', updated: b.text || b.summary || '' });
                        mapB.delete(key);
                    } else {
                        mapB.delete(key);
                    }
                }

                // remaining in B are added
                for (const b of mapB.values()) {
                    const key = byKey(b);
                    changes.push({ type: 'added', clause: key, updated: b.text || b.summary || '' });
                }

                // Compose summary: leverage AI compare fallback by asking /ask if available
                let summary: string | undefined = undefined;
                try {
                    const res = await fetch(`${AI_URL}/ask`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: `${textA}\n\n${textB}`, question: 'Summarize differences between A and B' })
                    });
                    const j = await handleResponse(res).catch(() => null);
                    if (j && j.data && j.data.answer) summary = j.data.answer;
                    else if (j && j.answer) summary = j.answer;
                } catch {
                    // ignore
                }

                return { summary, changes };
            } catch (err) {
                // Surface helpful message for frontend
                const msg = err instanceof Error ? err.message : String(err);
                throw new Error(`AI Service Error: ${msg}`);
            }
        }
    },
    blockchain: {
        verify: async (contractId: string, hash?: string): Promise<BlockchainVerification> => {
            // Check backend verification first (database status)
            // Or trigger verification on chain via backend
            const res = await fetch(`${API_URL}/blockchain/verify/${contractId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            const json = await handleResponse(res);
            const data = json.data;

            return {
                contractId,
                hash: data.blockchainHash,
                transactionHash: data.txHash,
                blockNumber: data.blockNumber,
                timestamp: data.verifiedAt,
                network: 'sepolia' // or from env
            };
        },
        checkHash: async (hash: string): Promise<any> => {
            // Check if a hash exists on the blockchain (for public verification)
            const res = await fetch(`${API_URL}/blockchain/check-hash`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ hash })
            });
            const json = await handleResponse(res);
            return json.data;
        },
        getData: async (): Promise<DashboardStats> => {
            const res = await fetch(`${API_URL}/contracts/stats`, { headers: getHeaders() });
            const json = await handleResponse(res);
            const stats = json.data;
            return {
                totalContracts: stats.total,
                totalContractsTrend: 0, // Backend might not calculate trend yet
                pendingReviews: stats.pending,
                highRiskDetected: stats.highRisk,
                blockchainVerified: stats.verified,
                blockchainVerifiedTrend: 0
            };
        }
    }
};
