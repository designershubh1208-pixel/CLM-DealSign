"use client"

import { Button } from "@/components/ui/button";
import { useBlockchainStore } from "@/stores/blockchain-store"; // Ensure this path is correct
import { Wallet } from "lucide-react";
import { truncateHash } from "@/lib/utils";

export function WalletConnect() {
    const { isConnected, walletAddress, connectWallet, network } = useBlockchainStore();

    if (isConnected && walletAddress) {
        return (
            <Button variant="outline" className="gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {truncateHash(walletAddress)}
                {network && <span className="text-xs bg-emerald-200/50 px-1.5 py-0.5 rounded capitalize ml-1">{network}</span>}
            </Button>
        );
    }

    return (
        <Button onClick={connectWallet} variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
            <Wallet className="h-4 w-4" />
            Connect Wallet
        </Button>
    );
}
