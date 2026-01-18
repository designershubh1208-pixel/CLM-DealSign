import { Badge } from "@/components/ui/badge";
import { cn, getRiskBgColor, getRiskColor } from "@/lib/utils";
import { RiskLevel } from "@/types";
import { ShieldAlert, ShieldCheck, Shield } from "lucide-react";

interface RiskBadgeProps {
    level: RiskLevel;
    className?: string;
    showIcon?: boolean;
}

export function RiskBadge({ level, className, showIcon = true }: RiskBadgeProps) {
    const Icon = level === 'high' ? ShieldAlert : level === 'medium' ? Shield : ShieldCheck;

    return (
        <Badge
            variant="outline"
            className={cn(
                "border-0 px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit",
                getRiskBgColor(level),
                getRiskColor(level),
                className
            )}
        >
            {showIcon && <Icon className="h-3.5 w-3.5" />}
            {level} Risk
        </Badge>
    );
}
