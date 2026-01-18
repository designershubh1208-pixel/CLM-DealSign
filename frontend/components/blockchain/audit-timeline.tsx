"use client"

import { AuditEvent } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";
import {
    FileUp,
    Search,
    CheckCheck,
    Eye,
    ShieldCheck,
    MessageSquare,
    AlertTriangle
} from "lucide-react";

interface AuditTimelineProps {
    events: AuditEvent[];
}

export function AuditTimeline({ events }: AuditTimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'uploaded': return FileUp;
            case 'analyzed': return Search;
            case 'reviewed': return Eye;
            case 'approved': return CheckCheck;
            case 'verified': return ShieldCheck;
            case 'commented': return MessageSquare;
            case 'rejected': return AlertTriangle;
            default: return FileUp;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'uploaded': return "bg-blue-100 text-blue-600 border-blue-200";
            case 'analyzed': return "bg-purple-100 text-purple-600 border-purple-200";
            case 'approved': return "bg-emerald-100 text-emerald-600 border-emerald-200";
            case 'verified': return "bg-indigo-100 text-indigo-600 border-indigo-200";
            case 'rejected': return "bg-red-100 text-red-600 border-red-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="relative space-y-0 pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-2">
            {events.map((event, index) => {
                const Icon = getIcon(event.type);
                const colorClass = getColor(event.type);

                return (
                    <div key={event.id} className="relative pb-8 last:pb-0">
                        <span
                            className={`absolute -left-[33px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-950 ${colorClass}`}
                        >
                            <Icon className="h-4 w-4" />
                        </span>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{event.description}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDateTime(event.timestamp)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={event.userAvatar} />
                                    <AvatarFallback className="text-[10px]">{event.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-500 font-medium">
                                    by {event.userName}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
