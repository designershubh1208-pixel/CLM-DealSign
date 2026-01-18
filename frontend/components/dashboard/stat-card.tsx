import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    description?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    change,
    icon: Icon,
    description,
    className
}: StatCardProps) {
    const isPositive = change && change > 0;

    return (
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                            {title}
                        </span>
                        <span className="text-2xl font-bold tracking-tight">
                            {value}
                        </span>
                        {description && (
                            <span className="text-xs text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </div>
                    <div className="p-2 bg-primary/5 rounded-full ring-1 ring-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>

                {change !== undefined && (
                    <div className="mt-4 flex items-center text-xs">
                        <span className={cn(
                            "flex items-center font-medium",
                            isPositive ? "text-emerald-600" : "text-red-600"
                        )}>
                            {isPositive ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(change)}%
                        </span>
                        <span className="text-muted-foreground ml-2">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
