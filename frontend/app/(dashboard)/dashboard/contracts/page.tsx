"use client"

import { useEffect, useState } from "react";
import { useContractStore } from "@/stores/contract-store";
import { ContractTable } from "@/components/contracts/contract-table";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor, getStatusLabel, getRiskColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ContractsPage() {
    const { contracts, fetchContracts } = useContractStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const filteredContracts = contracts.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.parties.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                return (
                    <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        <Link href={`/dashboard/contracts/${row.original.id}`}>
                            View Details
                        </Link>
                    </Button>
                )
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all your legal agreements in one place.
                    </p>
                </div>
                 <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                    <Link href="/dashboard/contracts/new">
                        <Plus className="mr-2 h-4 w-4" /> New Contract
                    </Link>
                </Button>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
                   <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contracts..."
                                className="pl-9 bg-white dark:bg-slate-950"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ContractTable
                        columns={columns}
                        data={filteredContracts}
                        searchPlaceholder="Search..."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
