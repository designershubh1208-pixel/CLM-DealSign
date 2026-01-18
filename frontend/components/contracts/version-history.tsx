"use client";

import React, { useEffect, useState } from 'react';
import { ContractVersion, Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const storageKey = (contractId: string) => `contract_versions_${contractId}`;

export function loadVersions(contractId: string): ContractVersion[] {
    try {
        const raw = localStorage.getItem(storageKey(contractId));
        if (!raw) return [];
        return JSON.parse(raw) as ContractVersion[];
    } catch {
        return [];
    }
}

export function saveVersion(contractId: string, version: ContractVersion) {
    const list = loadVersions(contractId);
    list.unshift(version);
    localStorage.setItem(storageKey(contractId), JSON.stringify(list));
}

export default function VersionHistory({ contract, onOpenVersion }: { contract: Contract | null, onOpenVersion?: (v: ContractVersion) => void }) {
    const [versions, setVersions] = useState<ContractVersion[]>([]);

    useEffect(() => {
        if (!contract) return;
        // Load local versions
        const local = loadVersions(contract.id);

        // Fetch backend contract metadata (best-effort) and merge as the latest version
        (async () => {
            try {
                const remote = await api.contracts.get(contract.id);
                const remoteVersion: ContractVersion = {
                    id: `${contract.id}-v${remote?.version || contract.version || 1}`,
                    contractId: contract.id,
                    version: remote?.version || contract.version || 1,
                    changedBy: remote?.updatedBy || remote?.createdBy || 'remote',
                    changedByName: remote?.updatedByName || remote?.createdBy || 'Remote',
                    changeSummary: remote?.changeSummary || 'Server version',
                    fileUrl: remote?.fileUrl || contract.fileUrl || '',
                    createdAt: remote?.updatedAt || remote?.createdAt || new Date().toISOString(),
                    // preserve full text when available
                    content: remote?.content || undefined,
                };

                // Merge remote at the front if it's not already present
                const merged = local.slice();
                if (!merged.find(v => v.version === remoteVersion.version)) {
                    merged.unshift(remoteVersion);
                }

                // Ensure at least one version exists
                if (merged.length === 0) merged.push(remoteVersion);

                // Defer state update to avoid React warning about setState in effect
                Promise.resolve().then(() => setVersions(merged));
            } catch (e) {
                // If backend fetch fails, fall back to local versions only
                Promise.resolve().then(() => setVersions(local));
            }
        })();
    }, [contract]);

    if (!contract) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Version History</h4>
                <div className="text-xs text-muted-foreground">Current: v{contract.version}</div>
            </div>

            <div className="space-y-3">
                {versions.length === 0 && <div className="text-sm text-muted-foreground">No versions available.</div>}
                {versions.map((v) => (
                    <div key={v.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <div className="font-medium">v{v.version} — {v.changeSummary}</div>
                                <div className="text-xs text-muted-foreground mt-1">By: {v.changedByName}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</div>
                                <div>
                                    <Button size="sm" variant="ghost" onClick={() => onOpenVersion && onOpenVersion(v)}>Open</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
