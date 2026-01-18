"use client"

import { useState } from "react";
import { FileUploadZone } from "@/components/contracts/upload-zone";
import { BlockchainStatusCard } from "@/components/blockchain/status-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Lock, UploadCloud, Search } from "lucide-react";
import { api } from "@/lib/api";
import { calculateFileHash } from "@/lib/utils";
import { BlockchainVerification } from "@/types";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
    // Page Component for Contract Verification
    const [file, setFile] = useState<File | null>(null);
    const [hash, setHash] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<BlockchainVerification | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFileSelect = async (selected: File) => {
        setFile(selected);
        const fileHash = await calculateFileHash(selected);
        setHash(fileHash);
        setResult(null);
        setHasSearched(false);
    };

    const handleVerify = async () => {
        if (!hash || !file) return;

        setIsVerifying(true);
        try {
            // Check if the hash exists on the blockchain
            const blockchainResult = await api.blockchain.checkHash(hash);
            
            // Convert blockchain result to BlockchainVerification format
            const verificationResult: BlockchainVerification = {
                contractId: blockchainResult.contractId || 'unknown',
                hash: hash,
                transactionHash: blockchainResult.txHash || '',
                blockNumber: blockchainResult.blockNumber || 0,
                timestamp: blockchainResult.verifiedAt || new Date().toISOString(),
                network: 'sepolia'
            };
            
            setResult(verificationResult);
        } catch (error) {
            console.error('Verification error:', error);
            setResult(null);
        } finally {
            setIsVerifying(false);
            setHasSearched(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center rotate-3 transform shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                        <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Public Contract Verifier</h1>
                <p className="text-lg text-muted-foreground">
                    Verify the integrity of any document against the blockchain without revealing its contents.
                    We calculate the cryptographic hash locally.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Document Source</CardTitle>
                        <CardDescription>Upload the file you want to verify</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FileUploadZone onFileSelect={handleFileSelect} />

                        <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-xs text-muted-foreground border flex gap-3">
                            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>
                                Your document privacy is guaranteed. The SHA-256 hash calculation happens entirely in your browser.
                                The file itself is never uploaded to our servers during verification.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base">Metadata & Hash</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {file ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">File Name</label>
                                        <p className="font-medium truncate">{file.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase">Local Hash (SHA-256)</label>
                                        <p className="font-mono text-xs break-all bg-white dark:bg-black p-2 rounded border">{hash}</p>
                                    </div>
                                    <Button onClick={handleVerify} disabled={isVerifying} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                        {isVerifying ? "Checking Blockchain..." : "Check Blockchain Record"}
                                    </Button>
                                </>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Search className="h-8 w-8 opacity-20" />
                                    <p className="text-sm">Waiting for file...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {hasSearched && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            {result ? (
                                <BlockchainStatusCard isVerified={true} verification={result} />
                            ) : (
                                <BlockchainStatusCard isVerified={false} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
