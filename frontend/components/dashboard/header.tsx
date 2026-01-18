"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

function NotificationsList() {
    const [items, setItems] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api';

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('deal_sign_token') : null;
            const res = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            // Treat 404 as "no notifications" (backend may not expose this endpoint)
            if (!res.ok) {
                if (res.status === 404) {
                    setItems([]);
                    try { window.dispatchEvent(new CustomEvent('dealsign:notifications', { detail: { unreadCount: 0 } })); } catch { }
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            const json = await res.json().catch(() => null);
            const list = json?.data || json || [];
            setItems(list);
            // dispatch unread count to allow header badge to update
            try {
                const unreadCount = (list || []).filter((it: any) => !it.isRead).length;
                window.dispatchEvent(new CustomEvent('dealsign:notifications', { detail: { unreadCount } }));
            } catch { }
        } catch (e: any) {
            setError(e?.message || 'Failed to load notifications');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load notifications on mount (best-effort).
        fetchNotifications();
    }, []);

    if (loading) return <div className="p-3 text-sm">Loading…</div>;
    if (error) return <div className="p-3 text-sm text-red-600">{error}</div>;
    if (!items || items.length === 0) return <div className="p-3 text-sm text-muted-foreground">No notifications</div>;

    const markRead = async (id: string) => {
        // Optimistic local update
        setItems((prev) => (prev || []).map((it: any) => (it.id === id ? { ...it, isRead: true } : it)));
        // Recompute and dispatch
        try {
            const current = (items || []).map((it: any) => (it.id === id ? { ...it, isRead: true } : it));
            const unreadCount = (current || []).filter((it: any) => !it.isRead).length;
            window.dispatchEvent(new CustomEvent('dealsign:notifications', { detail: { unreadCount } }));
        } catch { }

        // Try backend: POST /notifications/:id/read or fallback
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('deal_sign_token') : null;
            let res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) {
                // fallback endpoint
                res = await fetch(`${API_URL}/notifications/mark-read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ ids: [id] }),
                });
            }
            // ignore response; already updated locally
        } catch (e) {
            // ignore backend failure, keep optimistic update
        }
    };

    return (
        <div className="divide-y">
            {items.map((n: any) => (
                <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-1 p-2 ${n.isRead ? 'opacity-70' : 'bg-white/0'}`} onSelect={() => markRead(n.id)}>
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </DropdownMenuItem>
            ))}
        </div>
    );
}
import { WalletConnect } from "../blockchain/wallet-connect";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar"; // Reuse sidebar for mobile
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    const [unread, setUnread] = useState<number>(0);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api';

    // Listen for notification updates dispatched by NotificationsList
    useEffect(() => {
        const onUpdate = (e: any) => {
            const detail = e?.detail as any;
            if (detail && typeof detail.unreadCount === 'number') setUnread(detail.unreadCount);
        };
        window.addEventListener('dealsign:notifications', onUpdate as EventListener);
        // Try to fetch initial unread count (best-effort)
        (async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('deal_sign_token') : null;
                const res = await fetch(`${API_URL}/notifications/unread-count`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                if (!res.ok) return;
                const j = await res.json().catch(() => null);
                const count = j?.data?.count ?? j?.count ?? null;
                if (typeof count === 'number') setUnread(count);
            } catch (e) {
                // ignore
            }
        })();

        return () => window.removeEventListener('dealsign:notifications', onUpdate as EventListener);
    }, []);

    return (
        <header className="h-16 border-b bg-white dark:bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-10 w-full">

            {/* Mobile Menu */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r-slate-800">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative mx-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search contracts, clauses, or parties..."
                    className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full focus-visible:ring-indigo-500"
                />
                <div className="absolute right-3 top-2.5 flex gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <WalletConnect />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <Bell className="h-5 w-5" />
                            {unread > 0 ? (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 ring-2 ring-white dark:ring-slate-950">
                                    {unread > 99 ? '99+' : unread}
                                </span>
                            ) : (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950 opacity-0" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <NotificationsList />
                    </DropdownMenuContent>
                </DropdownMenu>
                <ThemeToggle />
            </div>
        </header>
    );
}
