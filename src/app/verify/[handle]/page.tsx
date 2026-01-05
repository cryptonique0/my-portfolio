"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface ProfileData {
  handle: string;
  owner: string;
  verified: boolean;
  reputationScore: number;
  credentialCount: number;
  createdAt: number;
  ipfsHash: string;
}

interface Credential {
  category: number;
  credentialType: string;
  issuer: string;
  issuedDate: number;
  expiryDate: number;
  verified: boolean;
  verificationCount: number;
}

const CATEGORY_NAMES = ["Education", "Work", "Certification", "Hackathon"];
const CATEGORY_COLORS = {
  0: "from-blue-500 to-cyan-500",
  1: "from-purple-500 to-pink-500",
  2: "from-orange-500 to-red-500",
  3: "from-green-500 to-emerald-500",
};

export default function VerifyProfilePage() {
  const params = useParams();
  const handle = params.handle as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In production, fetch from contract via API
        // For now, show structure
        if (!handle) throw new Error("Handle required");

        // Mock data for demo
        const mockProfile: ProfileData = {
          handle: handle as string,
          owner: "0x1234...5678",
          verified: true,
          reputationScore: 145,
          credentialCount: 3,
          createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
          ipfsHash: "QmExample...",
        };

        setProfile(mockProfile);
        setCredentials([]);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (handle) fetchData();
  }, [handle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">@{profile.handle}</h1>
          <Link
            href="/"
            className="text-sm text-purple-300 hover:text-purple-200"
          >
            ← Back
          </Link>
        </div>
        <p className="text-slate-400">
          Public on-chain professional identity verified on Base & Stacks
        </p>
      </div>

      {/* Identity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Wallet & Chain Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Identity</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Wallet Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-black/30 px-3 py-2 rounded text-purple-300">
                    {profile.owner}
                  </code>
                  <a
                    href={`https://basescan.org/address/${profile.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    View on BaseScan ↗
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Chain Support</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300">
                    ✓ Base Mainnet
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs text-orange-300">
                    ✓ Stacks Mainnet
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Profile Status</p>
                <div className="flex items-center gap-2 mt-2">
                  {profile.verified ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm text-green-300">Verified</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-sm text-yellow-300">Unverified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reputation & Stats */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Reputation</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Reputation Score</p>
                <p className="text-3xl font-bold mt-1 text-purple-400">
                  {profile.reputationScore}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <Link href="#breakdown" className="text-purple-400 hover:underline">
                    See breakdown ↓
                  </Link>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Credentials</p>
                  <p className="text-xl font-bold">{profile.credentialCount}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credentials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-6">Verified Credentials</h2>

        {credentials.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No credentials added yet</p>
            <p className="text-xs mt-2">
              User can add credentials at{" "}
              <Link href="/profile/create" className="text-purple-400 hover:underline">
                /profile/create
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {credentials.map((cred, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl border border-white/10 bg-gradient-to-r ${
                  CATEGORY_COLORS[cred.category as keyof typeof CATEGORY_COLORS]
                } p-0.5`}
              >
                <div className="rounded-[10px] bg-black/40 backdrop-blur p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        {CATEGORY_NAMES[cred.category]}
                      </p>
                      <h3 className="text-lg font-semibold mt-1">
                        {cred.credentialType}
                      </h3>
                      <p className="text-sm text-gray-400 mt-2">{cred.issuer}</p>
                    </div>
                    {cred.verified && (
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <span className="text-2xl">✓</span>
                        <span className="text-xs text-green-300 whitespace-nowrap">
                          Verified ({cred.verificationCount})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Issued {new Date(cred.issuedDate * 1000).toLocaleDateString()}
                    {cred.expiryDate > 0 &&
                      ` • Expires ${new Date(cred.expiryDate * 1000).toLocaleDateString()}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* On-Chain Proof Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-4">On-Chain Proofs</h2>
        <p className="text-gray-400 text-sm mb-4">
          Verify this profile directly on-chain through smart contracts.
        </p>

        <div className="space-y-3">
          <a
            href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 transition"
          >
            <div>
              <p className="font-semibold text-sm">OnChainResume Contract (Base)</p>
              <p className="text-xs text-gray-400">
                View contract and all profiles
              </p>
            </div>
            <span className="text-xl">→</span>
          </a>

          <a
            href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x"}#readContract`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
          >
            <div>
              <p className="font-semibold text-sm">Call getProfile() on BaseScan</p>
              <p className="text-xs text-gray-400">
                Read this profile data directly (no gas)
              </p>
            </div>
            <span className="text-xl">→</span>
          </a>

          <a
            href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x"}#readContract`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/50 transition"
          >
            <div>
              <p className="font-semibold text-sm">
                getReputation() - View Reputation Score
              </p>
              <p className="text-xs text-gray-400">
                See how reputation is calculated
              </p>
            </div>
            <span className="text-xl">→</span>
          </a>
        </div>
      </motion.div>

      {/* Reputation Breakdown */}
      <motion.div
        id="breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-4">How Reputation is Calculated</h2>
        <p className="text-gray-400 text-sm mb-6">
          Reputation is calculated transparently on-chain. No proprietary algorithms,
          just verifiable facts.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm">Base Score</span>
            <span className="font-semibold">+10</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm">Verified Profile</span>
            <span className="font-semibold">+{profile.verified ? "25" : "0"}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm">
              Credentials ({profile.credentialCount} × 5 each)
            </span>
            <span className="font-semibold">
              +{profile.credentialCount * 5}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm">Activity Bonus</span>
            <span className="font-semibold">+{profile.reputationScore - 10 - (profile.verified ? 25 : 0) - (profile.credentialCount * 5)}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500/50 mt-4">
            <span className="font-semibold">Total Reputation</span>
            <span className="text-2xl font-bold">{profile.reputationScore}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          📖 Read more about reputation mechanics in{" "}
          <Link href="/docs/reputation" className="text-purple-400 hover:underline">
            the documentation
          </Link>
        </p>
      </motion.div>

      {/* Trust Model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6 border border-white/10"
      >
        <h2 className="text-2xl font-semibold mb-4">Trust Model</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Self-Custodied</strong>: Only the wallet owner can create/update
              this profile
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Immutable</strong>: All credentials stored on-chain forever
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Community Verified</strong>: Credentials must be verified by 2+
              independent verifiers
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Transparent Reputation</strong>: Algorithm is public and auditable
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400">✓</span>
            <span>
              <strong>Multi-Chain</strong>: Same identity on Base (EVM) and Stacks
              (Bitcoin L2)
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
