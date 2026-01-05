"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { ON_CHAIN_RESUME_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { ResumeUploadForm } from "@/components/ResumeUploadForm";

export default function CreateProfilePage() {
  const { address, isConnected } = useAccount();
  const contractAddress = useMemo(() => (CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}` | "", []);
  const { data: txHash, isLoading: isPending, error, write } = useContractWrite({
    address: contractAddress || undefined,
    abi: ON_CHAIN_RESUME_ABI,
    functionName: "createProfile",
  });
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({ hash: txHash as `0x${string}` | undefined });

  const [handle, setHandle] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!contractAddress) {
      setStatus("Missing NEXT_PUBLIC_CONTRACT_ADDRESS; update .env.local and redeploy.");
      return;
    }
    setStatus(null);
    write?.({
      args: [handle, ipfsHash],
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-indigo-200">Base + Stacks ready</p>
        <h1 className="text-3xl font-bold">Create your on-chain profile</h1>
        <p className="text-slate-300 text-sm">
          Store the content hash on IPFS (or Talent Protocol), then write the handle + hash to the OnChainResume contract.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-effect rounded-2xl p-6 border border-white/10 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Handle</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. satoshi-dev"
              className="w-full mt-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Unique identifier used for lookups.</p>
          </div>
          <div>
            <label className="text-sm text-slate-300">IPFS hash</label>
            <input
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              placeholder="Qm... or https://ipfs.io/ipfs/..."
              className="w-full mt-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Upload JSON resume via /api/ipfs/upload then paste the returned CID.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isConnected || isPending || isConfirming}
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
        >
          {isPending ? "Waiting for wallet" : isConfirming ? "Confirming..." : "Write to chain"}
        </button>

        <div className="text-sm text-slate-300 space-y-2">
          <p>Wallet: {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</p>
          <p>Contract: {contractAddress || "Add NEXT_PUBLIC_CONTRACT_ADDRESS"}</p>
        </div>

        {status && <div className="text-amber-300 text-sm">{status}</div>}
        {error && <div className="text-rose-300 text-sm">{error.message}</div>}
        {isSuccess && txHash?.hash && (
          <div className="text-green-300 text-sm">Transaction confirmed: {txHash.hash}</div>
        )}
      </form>

      <div className="glass-effect rounded-2xl p-6 border border-white/10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload resume to IPFS</h2>
          <p className="text-slate-300 text-sm mb-4">Paste your structured resume JSON below. Choose your IPFS provider (Pinata, NFT.Storage, or Infura) and upload to get the content hash.</p>
          <ResumeUploadForm />
        </div>
        <hr className="border-white/10" />
        <div>
          <h2 className="text-xl font-semibold mb-2">Tips</h2>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            <li>Test on Base Sepolia or Stacks testnet before mainnet.</li>
            <li>Keep JSON payloads small to minimize gas; store media on IPFS.</li>
            <li>After creating, visit /profile/[handle] to verify the on-chain state.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
