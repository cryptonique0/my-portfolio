"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWithdrawalPoliciesCount, useSetWithdrawalPolicies, useIsVaultOwner } from '@/lib/hooks/useContracts';
import { type Address } from 'viem';

interface PolicyRow {
    minAmount: string;
    maxAmount: string;
    requiredApprovals: string;
    cooldown: string;
}

export function PolicyConfig({ vaultAddress }: { vaultAddress?: Address }) {
    const { address } = useAccount();
    const ownerCheck = useIsVaultOwner(vaultAddress, address as any);
    const countRes = useWithdrawalPoliciesCount(vaultAddress);
    const setPoliciesHook = useSetWithdrawalPolicies(vaultAddress);

    const [rows, setRows] = useState<PolicyRow[]>([]);
    const [loadingExisting, setLoadingExisting] = useState(true);

    useEffect(() => {
        // We intentionally avoid calling hooks in loops; show count and let owner set policies manually.
        setLoadingExisting(false);
    }, [countRes.data]);

    if (!ownerCheck.data) return null;

    const addRow = () => setRows(r => [...r, { minAmount: '0', maxAmount: '0', requiredApprovals: '1', cooldown: '0' }]);

    const updateRow = (idx: number, key: keyof PolicyRow, value: string) => {
        setRows(r => r.map((row, i) => i === idx ? { ...row, [key]: value } : row));
    };

    const removeRow = (idx: number) => setRows(r => r.filter((_, i) => i !== idx));

    const submit = async () => {
        try {
            const payload = rows.map(r => ({
                minAmount: BigInt(r.minAmount || '0'),
                maxAmount: BigInt(r.maxAmount || '0'),
                requiredApprovals: BigInt(r.requiredApprovals || '1'),
                cooldown: BigInt(r.cooldown || '0'),
            }));
            await setPoliciesHook.setPolicies(payload as any);
            alert('Policies submitted — wait for tx confirmation');
        } catch (e) {
            console.error(e);
            alert('Failed to set policies');
        }
    };

    return (
        <div>
            <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Withdrawal Policies (Owner)</h3>
            {loadingExisting ? (
                <p className="text-slate-400 text-sm">Loading...</p>
            ) : (
                <div className="space-y-4">
                    {rows.length > 0 && (
                        <div className="space-y-3">
                            {rows.map((r, i) => (
                                <div key={i} className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-300 dark:border-slate-700 space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Min Amount</label>
                                            <input 
                                                value={r.minAmount} 
                                                onChange={(e) => updateRow(i, 'minAmount', e.target.value)} 
                                                placeholder="0"
                                                className="w-full bg-white dark:bg-background-dark border border-gray-300 dark:border-border-dark rounded px-2 py-1 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Max Amount</label>
                                            <input 
                                                value={r.maxAmount} 
                                                onChange={(e) => updateRow(i, 'maxAmount', e.target.value)} 
                                                placeholder="0"
                                                className="w-full bg-white dark:bg-background-dark border border-gray-300 dark:border-border-dark rounded px-2 py-1 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Approvals</label>
                                            <input 
                                                value={r.requiredApprovals} 
                                                onChange={(e) => updateRow(i, 'requiredApprovals', e.target.value)} 
                                                placeholder="1"
                                                className="w-full bg-white dark:bg-background-dark border border-gray-300 dark:border-border-dark rounded px-2 py-1 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Cooldown</label>
                                            <input 
                                                value={r.cooldown} 
                                                onChange={(e) => updateRow(i, 'cooldown', e.target.value)} 
                                                placeholder="0"
                                                className="w-full bg-white dark:bg-background-dark border border-gray-300 dark:border-border-dark rounded px-2 py-1 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => removeRow(i)} 
                                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {rows.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-4">No policies added yet</p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={addRow} 
                            className="text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                            Add policy
                        </button>
                        <button 
                            onClick={submit} 
                            disabled={rows.length === 0 || setPoliciesHook.isPending}
                            className="ml-auto bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl transition-colors"
                        >
                            {setPoliciesHook.isPending ? 'Saving...' : 'Save policies'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PolicyConfig;
