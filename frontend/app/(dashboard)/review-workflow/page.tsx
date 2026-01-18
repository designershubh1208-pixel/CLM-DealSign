"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useContractStore } from "@/stores/contract-store";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { toast } from 'sonner';

export default function ReviewWorkflowPage() {
    const { contracts, fetchContracts, updateContractStatus } = useContractStore();

    React.useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleApprove = async (id: string) => {
        try {
            await updateContractStatus(id, 'approved');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Failed to approve');
        }
    };

    const handleRequestChanges = async (id: string) => {
        try {
            await updateContractStatus(id, 'under_review');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(msg || 'Failed to request changes');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Review & Approval Workflow</h1>
            <p className="text-muted-foreground mb-6">Track contract progress across review stages with role-based approvals.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-6 rounded-lg border bg-indigo-50">
                    <h3 className="font-semibold">Created</h3>
                    <div className="text-sm text-muted-foreground mt-2">Creator</div>
                </div>
                <div className="p-6 rounded-lg border">
                    <h3 className="font-semibold">Legal Review</h3>
                    <div className="text-sm text-muted-foreground mt-2">Reviewer</div>
                </div>
                <div className="p-6 rounded-lg border">
                    <h3 className="font-semibold">Final Approval</h3>
                    <div className="text-sm text-muted-foreground mt-2">Approver</div>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Comments & Annotations</CardTitle>
                    <CardDescription>Recent review notes and discussion.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {contracts.slice(0, 3).map(c => (
                            <div key={c.id} className="p-3 rounded bg-slate-50 dark:bg-slate-900/20 border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{c.title}</div>
                                        <div className="text-xs text-muted-foreground">{c.parties.join(', ')}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{formatDate(c.uploadDate)}</div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(c.id)}>Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleRequestChanges(c.id)}>Request Changes</Button>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/dashboard/contracts/${c.id}`}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6">
                <Button asChild variant="outline">
                    <Link href="/contract-comparison" className="gap-1">
                        Compare Versions <ArrowRight className="h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
