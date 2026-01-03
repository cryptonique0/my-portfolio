"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import Link from "next/link";

export default function CredentialsPage() {
  const { isConnected, address } = useAccount();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    issuer: "",
    issuedDate: "",
    expiryDate: "",
    proofUrl: "",
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="text-4xl font-bold">Credentials</h1>
        <p className="text-slate-400 max-w-md">Connect your wallet to manage your verified credentials.</p>
        <WalletConnectButton />
      </div>
    );
  }

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call smart contract function addCredential
    setCredentials([...credentials, formData]);
    setFormData({
      type: "",
      issuer: "",
      issuedDate: "",
      expiryDate: "",
      proofUrl: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Credentials</h1>
          <p className="text-slate-400">Manage your verified certificates, licenses, and credentials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
        >
          {showForm ? "Cancel" : "Add Credential"}
        </button>
      </div>

      {/* Add Credential Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <form onSubmit={handleAddCredential} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Credential Type (e.g., AWS Certification)"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-indigo-500 outline-none text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Issuer (e.g., Amazon)"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-indigo-500 outline-none text-white placeholder-slate-400"
                required
              />
              <input
                type="date"
                placeholder="Issued Date"
                value={formData.issuedDate}
                onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-indigo-500 outline-none text-white placeholder-slate-400"
                required
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-indigo-500 outline-none text-white placeholder-slate-400"
              />
              <input
                type="url"
                placeholder="Proof URL (e.g., link to certificate)"
                value={formData.proofUrl}
                onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-indigo-500 outline-none text-white placeholder-slate-400 md:col-span-2"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 transition font-semibold"
            >
              Add Credential
            </button>
          </form>
        </div>
      )}

      {/* Credentials List */}
      {credentials.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center space-y-4">
          <div className="text-4xl">📜</div>
          <h3 className="text-xl font-semibold">No credentials yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Add your first verified credential to start building your on-chain resume.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-block px-4 py-2 rounded-lg border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 transition"
          >
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((cred, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{cred.type}</h3>
                <span className="text-sm text-slate-400">Issued by {cred.issuer}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Issued: {new Date(cred.issuedDate).toLocaleDateString()}</span>
                {cred.expiryDate && <span>Expires: {new Date(cred.expiryDate).toLocaleDateString()}</span>}
              </div>
              {cred.proofUrl && (
                <a href={cred.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm">
                  View Certificate →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold">About Credentials</h3>
        <p className="text-sm text-slate-300">
          Credentials are verified certificates, licenses, and qualifications that you can add to your on-chain resume.
          Each credential is stored on the blockchain and can be verified by employers and other stakeholders.
        </p>
      </div>
    </div>
  );
}
