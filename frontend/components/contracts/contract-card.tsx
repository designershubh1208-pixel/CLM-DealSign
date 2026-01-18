import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contract, ContractStatus } from "@/types";
import { formatDate, getStatusColor, getStatusLabel, cn } from "@/lib/utils";
import { RiskBadge } from "@/components/ai/risk-badge";
import { FileText, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ContractCardProps {
    contract: Contract;
}

export function ContractCard({ contract }: ContractCardProps) {
    return (
        <Link href={`/dashboard/contracts/${contract.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-l-4" style={{
                borderLeftColor: contract.status === 'verified' ? '#4F46E5' : contract.riskLevel === 'high' ? '#EF4444' : undefined
            }}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-1 leading-snug">
                        {contract.title}
                    </CardTitle>
                    <Badge className={cn("ml-2 shrink-0", getStatusColor(contract.status))}>
                        {getStatusLabel(contract.status)}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {contract.type}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(contract.uploadDate)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex -space-x-2">
                                {contract.parties.slice(0, 3).map((party, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-600 first-letter:uppercase" title={party}>
                                        {party.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <RiskBadge level={contract.riskLevel} showIcon={true} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}


