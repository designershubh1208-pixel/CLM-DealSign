"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useContractStore } from "@/stores/contract-store";
import { useAIStore } from "@/stores/ai-store";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Share2,
    Download,
    Search,
    Sparkles,
    ShieldCheck,
    History,
    MessageSquare,
    FileText,
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { AIInsightPanel } from "@/components/ai/insight-panel";
import { ChatInterface } from "@/components/ai/chat-interface";
import VersionHistory, { saveVersion, loadVersions } from '@/components/contracts/version-history';
import { BlockchainStatusCard } from "@/components/blockchain/status-card";
import { AuditTimeline } from "@/components/blockchain/audit-timeline";
import { getStatusColor, getStatusLabel, formatDate, getRiskColor, getRiskBgColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AuditEvent, BlockchainVerification, ContractVersion } from "@/types";

export default function ContractDetailPage() {
    const { id } = useParams();
    const contractId = (Array.isArray(id) ? id[0] : id) || "";
    const { selectedContract, fetchContractById, isLoading: isContractLoading, updateContractStatus } = useContractStore();
    const { analysis, analyzeContract, isAnalyzing, chatHistory, askQuestion, isChatLoading } = useAIStore();
    const { isConnected, verifyContractOnChain, isVerifying, walletAddress } = useBlockchainStore();

    const [verification, setVerification] = useState<BlockchainVerification | undefined>(undefined);
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

    useEffect(() => {
        if (contractId) {
            fetchContractById(contractId);
            analyzeContract(contractId);

            // Fetch audit trail (mock)
            // fetchAuditTrail(contractId);
            setAuditEvents([
                { id: '1', contractId, type: 'uploaded', description: 'Contract uploaded', userId: 'user-1', userName: 'Alex Morgan', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { id: '2', contractId, type: 'analyzed', description: 'AI Analysis completed', userId: 'system', userName: 'DealSign AI', timestamp: new Date(Date.now() - 86000000).toISOString() },
            ]);

            // Check blockchain status (mock)
            if (selectedContract?.isVerified) {
                api.blockchain.verify(contractId, selectedContract.blockchainHash || "").then(setVerification);
            }
        }
    }, [contractId, fetchContractById, analyzeContract]); // Removed selectedContract from deps to avoid loop

    const handleVerify = async () => {
        if (!selectedContract) return;
        try {
            await verifyContractOnChain(contractId, "0xMockHash...");
            // In a real app, update contract status in store
            // But we just updated the store locally
            updateContractStatus(contractId, 'verified');

            // Update local state
            setVerification({
                contractId,
                hash: "0xMockHash...",
                transactionHash: "0x123...",
                blockNumber: 12345678,
                timestamp: new Date().toISOString(),
                network: 'startNet'
            });

            toast.success("Verification successful!");
        } catch (error) {
            // Handled by store
        }
    };

    const handleApprove = () => updateContractStatus(contractId, 'approved');
    const handleReject = () => updateContractStatus(contractId, 'rejected');

    // Edit modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editParties, setEditParties] = useState('');
    const [editContent, setEditContent] = useState('');
    const [currentContent, setCurrentContent] = useState<string>('');

    // Version view modal
    const [isVersionOpen, setIsVersionOpen] = useState(false);
    const [versionToShow, setVersionToShow] = useState<any | null>(null);

    const openVersionFile = async (fileUrl?: string) => {
        if (!fileUrl) {
            toast.error('No file URL available for this version');
            return;
        }

        const apiBase = ((process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
        const abs = fileUrl.startsWith('http') ? fileUrl : (fileUrl.startsWith('/') ? `${apiBase}${fileUrl}` : `${apiBase}/${fileUrl}`);

        try {
            const token = localStorage.getItem('deal_sign_token');
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(abs, { headers });
            if (!res.ok) {
                // If file not found or forbidden, silently fallback to opening the URL in a new tab
                window.open(abs, '_blank', 'noopener,noreferrer');
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            // revoke after some time
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (_err) {
            // Network or other error: fallback silently to opening the URL in a new tab
            window.open(abs, '_blank', 'noopener,noreferrer');
        }
    };

    useEffect(() => {
        if (selectedContract) {
            setEditTitle(selectedContract.title);
            setEditParties(selectedContract.parties.join(', '));
            // reset editContent; we'll fetch actual file text if available
            setEditContent('');
            setCurrentContent('');
        }
    }, [selectedContract]);

    // Load the actual contract text (if fileUrl present) when selectedContract changes
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!selectedContract) return;
            try {
                if (selectedContract.fileUrl) {
                    const apiBase = ((process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
                    const abs = selectedContract.fileUrl.startsWith('http') ? selectedContract.fileUrl : (selectedContract.fileUrl.startsWith('/') ? `${apiBase}${selectedContract.fileUrl}` : `${apiBase}/${selectedContract.fileUrl}`);
                    const token = localStorage.getItem('deal_sign_token');
                    const headers: Record<string, string> = {};
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const res = await fetch(abs, { headers });
                    if (!res.ok) {
                        // silently ignore non-OK (404/403) and don't log to console
                        return;
                    }
                    const txt = await res.text();
                    if (!cancelled) {
                        setCurrentContent(txt);
                        // only set editContent if user hasn't already typed into it
                        setEditContent((prev) => prev || txt);
                    }
                }
            } catch (_err) {
                // Ignore network or other errors silently to avoid console noise
            }
        };
        load();
        return () => { cancelled = true; };
    }, [selectedContract]);

    if (isContractLoading || !selectedContract) {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-1/3" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-6 h-[600px]">
                    <Skeleton className="col-span-3 h-full" />
                    <Skeleton className="col-span-2 h-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-6 lg:-m-8">
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-slate-950 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/contracts">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold truncate max-w-md" title={selectedContract.title}>{selectedContract.title}</h1>
                            <Badge className={getStatusColor(selectedContract.status)}>{getStatusLabel(selectedContract.status)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <FileText className="h-3 w-3" /> {selectedContract.type}
                            <span className="text-slate-300">•</span>
                            Last updated {formatDate(selectedContract.updatedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>

                    {analysis && !['approved', 'rejected', 'verified'].includes(selectedContract.status) && (
                        <>
                            <Button size="sm" variant="destructive" onClick={handleReject}>Reject</Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>Edit</Button>
                        </>
                    )}

                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">

                {/* Left: Document Viewer */}
                <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col border-r">
                    <div className="p-2 bg-white dark:bg-slate-950 border-b flex items-center justify-between text-xs">
                        <div className="flex gap-2">
                            <span className="font-semibold text-slate-500">Page 1 of 8</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">Zoom: 100%</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded"><Search className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                        <div className="bg-white dark:bg-zinc-950 shadow-lg border w-full max-w-[800px] min-h-[1000px] p-12 text-sm leading-relaxed relative">
                            {/* Mock Document Content */}
                            <div className="space-y-6 font-serif">
                                <h2 className="text-2xl font-bold text-center mb-8 uppercase">{selectedContract.title}</h2>
                                <p><strong>THIS AGREEMENT</strong> (the "Agreement") is made effective as of {formatDate(selectedContract.uploadDate)}, by and between:</p>

                                <p><strong>{selectedContract.parties[0]}</strong>, ("Client"), and <strong>{selectedContract.parties[1]}</strong>, ("Provider").</p>

                                <h4 className="font-bold border-b border-black pb-1 mt-6">1. SERVICES</h4>
                                <p>Provider agrees to provide the services described in the Statement of Work attached hereto as Exhibit A.</p>

                                <h4 className="font-bold border-b border-black pb-1 mt-6">4. PAYMENT</h4>
                                <div className={`p-1 -m-1 rounded transition-colors ${analysis?.clauses.find(c => c.section === '4.1' && c.risk !== 'low') ? 'bg-amber-100 dark:bg-amber-900/30' : ''}`}>
                                    <p><strong>4.1 Terms.</strong> Client shall pay all undisputed invoices within thirty (30) days of receipt.</p>
                                </div>

                                <h4 className="font-bold border-b border-black pb-1 mt-6">8. LIABILITY</h4>
                                <div className={`p-1 -m-1 rounded transition-colors ${analysis?.clauses.find(c => c.type === 'liability' && c.risk === 'high') ? 'bg-red-100 dark:bg-red-900/30' : ''}`}>
                                    <p><strong>8.3 Limitation.</strong> EXCEPT FOR GROSS NEGLIGENCE, NEITHER PARTY SHALL BE LIABLE FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES.</p>
                                </div>

                                <h4 className="font-bold border-b border-black pb-1 mt-6">12. GENERAL</h4>
                                <p>This Agreement shall be governed by the laws of the State of Delaware.</p>

                                {/* ... more mock content ... */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Analysis & Tools */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                    <Tabs defaultValue="ai" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 py-2 border-b bg-slate-50/50 dark:bg-slate-900/50">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="ai" className="gap-2"><Sparkles className="h-4 w-4" /><span className="hidden xl:inline">AI Analysis</span></TabsTrigger>
                                <TabsTrigger value="chat" className="gap-2"><MessageSquare className="h-4 w-4" /><span className="hidden xl:inline">Chat</span></TabsTrigger>
                                <TabsTrigger value="verify" className="gap-2"><ShieldCheck className="h-4 w-4" /><span className="hidden xl:inline">Blockchain</span></TabsTrigger>
                                <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /><span className="hidden xl:inline">History</span></TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/50">
                            <TabsContent value="ai" className="p-4 m-0 space-y-4">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-indigo-600" />
                                        </div>
                                        <p className="text-sm text-muted-foreground animate-pulse">Analyzing clauses and risks...</p>
                                    </div>
                                ) : analysis ? (
                                    <AIInsightPanel
                                        summary={analysis.summary}
                                        riskScore={analysis.riskScore}
                                        clauses={analysis.clauses}
                                        risks={analysis.risks}
                                    />
                                ) : (
                                    <div className="text-center p-8 text-muted-foreground">
                                        No analysis available.
                                        <Button onClick={() => analyzeContract(contractId)} variant="link">Run Analysis</Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="chat" className="p-4 m-0 h-full">
                                <ChatInterface
                                    contractId={contractId}
                                    history={chatHistory}
                                    onSendMessage={(msg) => askQuestion(contractId, msg)}
                                    isLoading={isChatLoading}
                                />
                            </TabsContent>

                            <TabsContent value="verify" className="p-4 m-0 space-y-6">
                                <BlockchainStatusCard
                                    isVerified={selectedContract.isVerified}
                                    verification={verification}
                                    onVerify={handleVerify}
                                    isLoading={isVerifying}
                                />

                                <Card>
                                    <CardContent className="pt-6">
                                        <h3 className="text-sm font-semibold mb-4">Audit Trail</h3>
                                        <AuditTimeline events={auditEvents} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* Edit Modal (simple inline modal) */}
                            {isEditOpen && selectedContract && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditOpen(false)} />
                                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded shadow-lg w-full max-w-lg">
                                        <h3 className="text-lg font-semibold mb-4">Edit Contract</h3>
                                        <label className="text-sm">Title</label>
                                        <input className="w-full p-2 my-2 border rounded" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                        <label className="text-sm">Parties (comma separated)</label>
                                        <input className="w-full p-2 my-2 border rounded" value={editParties} onChange={(e) => setEditParties(e.target.value)} />
                                        <label className="text-sm">Full Contract Text</label>
                                        <textarea className="w-full p-2 my-2 border rounded h-40 font-serif text-sm" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                            <Button onClick={async () => {
                                                try {
                                                    const partiesArr = editParties.split(',').map(s => s.trim()).filter(Boolean);
                                                    // Attempt to update backend metadata; include content as best-effort (backend may ignore unknown fields)
                                                    const updated = await api.contracts.update(selectedContract.id, { title: editTitle, parties: partiesArr, content: editContent });
                                                    // Save version snapshot locally
                                                    const newVersion = (loadVersions(selectedContract.id)[0]?.version || selectedContract.version || 1) + 1;
                                                    saveVersion(selectedContract.id, {
                                                        id: `${selectedContract.id}-v${newVersion}`,
                                                        contractId: selectedContract.id,
                                                        version: newVersion,
                                                        changedBy: (updated.createdBy || 'system'),
                                                        changedByName: (updated.createdBy || 'User'),
                                                        changeSummary: 'Edited metadata',
                                                        fileUrl: updated.fileUrl || '',
                                                        content: editContent || currentContent || '',
                                                        createdAt: new Date().toISOString()
                                                    });
                                                    // Refresh selected contract in store
                                                    await fetchContractById(selectedContract.id);
                                                    // update displayed content locally
                                                    setCurrentContent(editContent || currentContent);
                                                    setIsEditOpen(false);
                                                    toast.success('Contract updated and version saved locally');
                                                } catch (err) {
                                                    console.error('Failed to update contract:', err);
                                                    toast.error('Failed to update contract');
                                                }
                                            }} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Version viewer modal */}
                            {isVersionOpen && versionToShow && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsVersionOpen(false)} />
                                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">Version v{versionToShow.version} — {versionToShow.changeSummary}</h3>
                                                <div className="text-sm text-muted-foreground">By: {versionToShow.changedByName} • {new Date(versionToShow.createdAt).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <Button variant="ghost" onClick={() => setIsVersionOpen(false)}>Close</Button>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            {versionToShow.content ? (
                                                <pre className="whitespace-pre-wrap font-serif text-sm">{versionToShow.content}</pre>
                                            ) : versionToShow.fileUrl ? (
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">This version has a file link:</div>
                                                    <Button variant="link" onClick={() => openVersionFile(versionToShow.fileUrl)}>Open file in new tab</Button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No file content available for this version.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <TabsContent value="history" className="p-4 m-0">
                                <div className="grid gap-4">
                                    <VersionHistory contract={selectedContract} onOpenVersion={(v) => { setVersionToShow(v); setIsVersionOpen(true); }} />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
