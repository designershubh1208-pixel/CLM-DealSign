import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangeItem {
    type: string; // added | removed | modified
    clause?: string;
    original?: string;
    updated?: string;
    highlights?: string[];
}

export default function ContractComparison({ contractAId, contractBId }: { contractAId: string | null; contractBId: string | null }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ summary?: string; changes?: ChangeItem[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisA, setAnalysisA] = useState<any | null>(null);
    const [analysisB, setAnalysisB] = useState<any | null>(null);

    const runCompare = async () => {
        if (!contractAId || !contractBId) return;
        setLoading(true);
        setError(null);
        setAnalysisA(null);
        setAnalysisB(null);
        try {
            // Try to fetch clause-level analyses for both contracts first (best-effort)
            try {
                const [a, b] = await Promise.all([
                    api.ai.analyze(contractAId),
                    api.ai.analyze(contractBId)
                ]);
                setAnalysisA(a);
                setAnalysisB(b);
            } catch (analysisErr) {
                // Non-fatal: we'll still run compare even if analyses fail
                // eslint-disable-next-line no-console
                console.warn('Clause analysis failed (non-fatal):', analysisErr);
            }
            const res = await api.ai.compare(contractAId, contractBId);
            // Support both data shapes: { summary, changes } or { data: { summary, changes }}
            const payload = res?.data ? res.data : res;
            setResult(payload);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err) || 'Compare failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Contract Comparison View</h2>
                    <p className="text-sm text-muted-foreground">Compare contract versions and highlight AI-identified clause changes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={runCompare} disabled={loading || !contractAId || !contractBId}>
                        {loading ? 'Comparing…' : 'Run AI Compare'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contract A - Extracted Clauses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-56">
                            <div className="space-y-3">
                                {analysisA?.clauses?.length ? (
                                    analysisA.clauses.map((c: any, i: number) => (
                                        <div key={i} className="p-3 border rounded-md bg-white/50">
                                            <div className="font-medium">{c.section || c.title || `Clause ${i + 1}`}</div>
                                            <div className="text-sm text-muted-foreground mt-1 line-clamp-3">{c.summary || c.text || ''}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground">No extracted clauses available for Contract A.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contract B - Extracted Clauses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-56">
                            <div className="space-y-3">
                                {analysisB?.clauses?.length ? (
                                    analysisB.clauses.map((c: any, i: number) => (
                                        <div key={i} className="p-3 border rounded-md bg-white/50">
                                            <div className="font-medium">{c.section || c.title || `Clause ${i + 1}`}</div>
                                            <div className="text-sm text-muted-foreground mt-1 line-clamp-3">{c.summary || c.text || ''}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground">No extracted clauses available for Contract B.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="min-h-[80px]">{result?.summary ?? <span className="text-sm text-muted-foreground">No summary available.</span>}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {!result?.changes || result.changes.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No changes detected.</div>
                            ) : (
                                result.changes.map((c, idx) => (
                                    <div key={idx} className="p-3 border rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{c.clause ?? 'Clause'}</div>
                                            <Badge className={c.type === 'added' ? 'bg-emerald-100 text-emerald-800' : c.type === 'removed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>{c.type}</Badge>
                                        </div>
                                        {c.original && (
                                            <div className="mt-2 text-sm">
                                                <div className="font-semibold">Original</div>
                                                <pre className="whitespace-pre-wrap text-sm text-muted-foreground mt-1">{c.original}</pre>
                                            </div>
                                        )}
                                        {c.updated && (
                                            <div className="mt-2 text-sm">
                                                <div className="font-semibold">Updated</div>
                                                <pre className="whitespace-pre-wrap text-sm text-muted-foreground mt-1">{c.updated}</pre>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

