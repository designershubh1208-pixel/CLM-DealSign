"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlockchainVerification } from "@/types";
import { CheckCircle, Shield, Copy, ExternalLink, XCircle, Clock } from "lucide-react";
import { truncateHash, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BlockchainStatusCardProps {
    verification?: BlockchainVerification;
    isVerified: boolean;
    onVerify?: () => void;
    isLoading?: boolean;
}

export function BlockchainStatusCard({
    verification,
    isVerified,
    onVerify,
    isLoading
}: BlockchainStatusCardProps) {
    const handleCopy = async (text: string) => {
        const success = await copyToClipboard(text);
        if (success) toast.success("Copied to clipboard");
    };

    if (!isVerified) {
        return (
            <Card className="border-l-4 border-l-slate-300 dark:border-l-slate-700">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Shield className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Not Verified on Blockchain</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                This contract has not been anchored to the blockchain yet. Verification ensures immutability.
                            </p>
                        </div>
                    </div>
                    {onVerify && (
                        <Button onClick={onVerify} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                            {isLoading ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" /> Verify Now
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <div>
                            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Verified on Blockchain</h3>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 font-medium">
                                Immutable Record • {verification?.network?.toUpperCase() || 'POLYGON'}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" asChild>
                        <a href={`https://polygonscan.com/tx/${verification?.transactionHash}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" /> View Explorer
                        </a>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Hash (SHA-256)</label>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border font-mono text-xs">
                            <span className="truncate flex-1">{verification?.hash}</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(verification?.hash || "")}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy Hash</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction Hash</label>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border font-mono text-xs">
                            <span className="truncate flex-1">{verification?.transactionHash}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(verification?.transactionHash || "")}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between md:col-span-2 text-sm pt-2">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Block Number</span>
                            <span className="font-mono font-medium">#{verification?.blockNumber?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-muted-foreground text-xs">Timestamp</span>
                            <span className="font-medium">{verification?.timestamp ? new Date(verification.timestamp).toLocaleString() : '-'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
