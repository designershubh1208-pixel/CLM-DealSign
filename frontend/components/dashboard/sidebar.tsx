"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME, NAVIGATION_ITEMS } from "@/lib/constants";
import { FileSignature, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useUserStore();

    return (
        <div className="flex flex-col h-full border-r bg-white text-slate-800 w-64 md:w-64 shrink-0 transition-all duration-300">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <FileSignature className="h-5 w-5 text-white" />
                    </div>
                    <span>{APP_NAME}</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {NAVIGATION_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
                                {item.name}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* User / Footer */}
            <div className="p-4 border-t border-slate-200">
                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            AM
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Alex Morgan</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2 justify-start px-3"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
