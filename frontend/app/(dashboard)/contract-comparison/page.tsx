"use client"

import React, { useEffect, useState } from 'react';
import ContractComparison from '@/components/ai/ContractComparison';
import { api } from '@/lib/api';
import { Contract } from '@/types';

export default function ContractComparisonPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [aId, setAId] = useState<string | null>(null);
    const [bId, setBId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const list = await api.contracts.list();
                setContracts(list);
                if (list.length >= 2) {
                    setAId(list[0].id);
                    setBId(list[1].id);
                } else if (list.length === 1) {
                    setAId(list[0].id);
                }
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Contract Comparison View</h1>

            <div className="mb-4 flex gap-3 items-center">
                <div>
                    <label className="block text-sm font-medium">Version A</label>
                    <select value={aId ?? ''} onChange={(e) => setAId(e.target.value)} className="mt-1 border px-2 py-1 rounded">
                        <option value="">Select version A</option>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.title || c.id}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Version B</label>
                    <select value={bId ?? ''} onChange={(e) => setBId(e.target.value)} className="mt-1 border px-2 py-1 rounded">
                        <option value="">Select version B</option>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.title || c.id}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() => { /* button handled by ContractComparison component */ }}
                    >
                        Run AI Compare
                    </button>
                </div>
            </div>

            {loading && <div>Loading contracts…</div>}

            <ContractComparison contractAId={aId} contractBId={bId} />
        </div>
    );
}
