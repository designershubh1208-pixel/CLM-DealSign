import { ContractType, RiskLevel } from "@/types";
import {
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    File,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Search
} from "lucide-react";

export const APP_NAME = "DealSign";
export const APP_DESCRIPTION = "AI-Powered Contract Lifecycle Management with Blockchain Verification";

export const CONTRACT_TYPES: ContractType[] = ['NDA', 'MSA', 'SLA', 'SOW', 'Other'];

export const NAVIGATION_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contracts", href: "/dashboard/contracts", icon: FileText },
    { name: "Review Workflow", href: "/review-workflow", icon: Clock },
    { name: "Compare Versions", href: "/contract-comparison", icon: Search },
    { name: "Verify", href: "/dashboard/verify", icon: ShieldCheck },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const CONTRACT_STATUS_CONFIG = {
    draft: { label: "Draft", color: "bg-slate-500", icon: File },
    under_review: { label: "Under Review", color: "bg-amber-500", icon: Clock },
    approved: { label: "Approved", color: "bg-emerald-500", icon: CheckCircle },
    verified: { label: "Verified", color: "bg-indigo-500", icon: Shield },
    rejected: { label: "Rejected", color: "bg-red-500", icon: AlertTriangle },
};

export const RISK_LEVEL_CONFIG = {
    low: { label: "Low Risk", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    medium: { label: "Medium Risk", color: "text-amber-500", bg: "bg-amber-500/10" },
    high: { label: "High Risk", color: "text-red-500", bg: "bg-red-500/10" },
};

// Mock data constants
export const MOCK_TEAMS = [
    { id: "team-1", name: "Legal Team" },
    { id: "team-2", name: "Executive Team" },
];

export const MOCK_USERS = [
    {
        id: "user-1",
        name: "Alex Morgan",
        email: "alex@dealsign.com",
        role: "admin",
        teamId: "team-1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    {
        id: "user-2",
        name: "Sarah Chen",
        email: "sarah@dealsign.com",
        role: "legal",
        teamId: "team-1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
];
