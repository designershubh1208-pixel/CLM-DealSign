"use client"

import { useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { useUserStore } from "@/stores/user-store";
import { StatCard } from "@/components/dashboard/stat-card";
import { ContractTable } from "@/components/contracts/contract-table";
import { FileUploadZone } from "@/components/contracts/upload-zone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    FileText,
    Clock,
    ShieldAlert,
    ShieldCheck,
    Plus,
    Zap,
    ArrowRight,
    TrendingUp,
    Activity
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel, getRiskColor, getRiskBgColor } from "@/lib/utils";

export default function DashboardPage() {
    const { contracts, fetchContracts, isLoading, deleteContract } = useContractStore();
    const { user } = useUserStore();

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // Derived metrics
    const totalContracts = contracts.length;
    const pendingReviews = contracts.filter(c => c.status === 'under_review').length;
    const highRiskContracts = contracts.filter(c => c.riskLevel === 'high');
    const highRiskCount = highRiskContracts.length;
    const verifiedContracts = contracts.filter(c => c.isVerified).length;

    const columns: ColumnDef<Contract>[] = [
        {
            accessorKey: "title",
            header: "Contract Name",
            cell: ({ row }) => {
                const contract = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{contract.title}</span>
                        <span className="text-xs text-muted-foreground">{contract.type} • {contract.parties.join(", ")}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge className={getStatusColor(status)}>
                        {getStatusLabel(status)}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "riskLevel",
            header: "Risk",
            cell: ({ row }) => {
                const risk = row.getValue("riskLevel") as 'low' | 'medium' | 'high';
                return (
                    <div className={`flex items-center gap-1.5 ${getRiskColor(risk)}`}>
                        <span className={`w-2 h-2 rounded-full ${risk === 'high' ? 'bg-red-500' : risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="capitalize text-sm font-medium">{risk}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "uploadDate",
            header: "Date",
            cell: ({ row }) => {
                return <span className="text-sm text-muted-foreground">{formatDate(row.getValue("uploadDate"))}</span>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const contract = row.original as Contract;
                return (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <Link href={`/dashboard/contracts/${contract.id}`}>
                                View
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Delete this contract? This action cannot be undone.')) return;
                                await deleteContract(contract.id);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                )
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                        <Link href="/dashboard/contracts/new">
                            <Plus className="mr-2 h-4 w-4" /> New Contract
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Contracts"
                    value={totalContracts}
                    change={12}
                    icon={FileText}
                    description="Active contracts"
                />
                <StatCard
                    title="Pending Reviews"
                    value={pendingReviews}
                    change={-5}
                    icon={Clock}
                    description="Requires attention"
                    className="border-amber-200 dark:border-amber-900/50 bg-amber-50/10"
                />
                <StatCard
                    title="High Risk Detected"
                    value={highRiskCount}
                    change={2}
                    icon={ShieldAlert}
                    description="Critical warnings"
                    className="border-red-200 dark:border-red-900/50 bg-red-50/10"
                />
                <StatCard
                    title="Blockchain Verified"
                    value={verifiedContracts}
                    change={8}
                    icon={ShieldCheck}
                    description="Immutable records"
                    className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Main Table */}
                <div className="md:col-span-5 space-y-4">
                    <Card className="border-none shadow-md">
                        <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-1">
                                <CardTitle>Recent Contracts</CardTitle>
                                <CardDescription>
                                    Manage and track your latest contract activities
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/dashboard/contracts" className="gap-1">
                                    View All <ArrowRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ContractTable
                                columns={columns}
                                data={contracts.slice(0, 5)}
                                searchPlaceholder="Filter recent contracts..."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar - Quick Actions & Insights */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Link href="/dashboard/contracts/new">
                                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Upload Contract</p>
                                        <p className="text-xs text-muted-foreground">Analyze and sign</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/verify">
                                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Verify Integrity</p>
                                        <p className="text-xs text-muted-foreground">Check blockchain hash</p>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-500" />
                                AI Risk Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[240px]">
                                <div className="p-4 space-y-3">
                                    {highRiskContracts.length > 0 ? contracts.filter(c => c.riskLevel === 'high').slice(0, 3).map(c => (
                                        <Link key={c.id} href={`/dashboard/contracts/${c.id}`}>
                                            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                                                <div className="flex items-start justify-between">
                                                    <p className="text-sm font-medium text-red-900 dark:text-red-200 line-clamp-1">{c.title}</p>
                                                    <ArrowRight className="h-3 w-3 text-red-400 opacity-50" />
                                                </div>
                                                <p className="text-xs text-red-600/80 dark:text-red-400 mt-1">
                                                    Critical liabilities detected
                                                </p>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No high risks detected
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
