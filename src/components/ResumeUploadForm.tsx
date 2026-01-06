"use client";

import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { ON_CHAIN_RESUME_ABI } from "@/lib/contract";

type ProviderOption = "pinata" | "nftstorage" | "infura";

type UploadResponse = {
  ipfsHash: string;
  gateway: string;
  provider: ProviderOption;
};

type TxPayload = {
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  from: `0x${string}`;
  chainId?: string;
};

const PROVIDERS: ProviderOption[] = ["pinata", "nftstorage", "infura"];

export function ResumeUploadForm() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [jsonText, setJsonText] = useState(() => 
    JSON.stringify({
      address: address ?? "",
      name: "",
      bio: "",
      skills: [],
      experience: [],
      education: [],
      projects: []
    }, null, 2)
  );
  const [provider, setProvider] = useState<ProviderOption>("pinata");
  const [status, setStatus] = useState<string>("");
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setStatus("");
    setIpfsHash("");
    setTxHash("");

    if (!isConnected || !address) {
      setStatus("Connect wallet first.");
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(jsonText);
    } catch (err) {
      setStatus("Invalid JSON");
      return;
    }

    if (!payload.address) {
      payload.address = address;
    }

    if (payload.address.toLowerCase() !== address.toLowerCase()) {
      setStatus("JSON address must match connected wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      setStatus("Uploading to IPFS...");
      const uploadRes = await fetch(`/api/ipfs/upload?provider=${provider}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(text || "Upload failed");
      }

      const uploadJson = (await uploadRes.json()) as UploadResponse;
      setIpfsHash(uploadJson.ipfsHash);

      setStatus("Preparing transaction...");
      const txRes = await fetch(`/api/contract/profile/${address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ipfsHash: uploadJson.ipfsHash }),
      });

      if (!txRes.ok) {
        const text = await txRes.text();
        throw new Error(text || "Tx prep failed");
      }

      const txPayload = (await txRes.json()) as TxPayload;

      if (!walletClient) {
        throw new Error("Wallet client unavailable");
      }

      setStatus("Sending transaction...");
      const hash = await walletClient.sendTransaction({
        to: txPayload.to,
        data: txPayload.data,
        value: BigInt(txPayload.value || "0"),
      });

      setTxHash(hash);
      setStatus("Transaction sent. Waiting for confirmation...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStatus("Profile updated on-chain");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-700/50 bg-black/30 p-4 text-sm text-white">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Upload Resume to IPFS</h3>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span>Provider:</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderOption)}
            className="rounded-lg border border-gray-600 bg-gray-800 px-2 py-1 text-white"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={12}
        className="w-full rounded-lg border border-gray-700 bg-gray-900/80 p-3 font-mono text-xs text-gray-100 focus:border-purple-500 focus:outline-none"
      />

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Processing..." : "Upload & Update Profile"}
      </button>

      {status && <p className="text-xs text-gray-300">{status}</p>}

      {ipfsHash && (
        <div className="rounded-lg bg-gray-800/70 p-3 text-xs text-gray-200">
          <div className="font-semibold">IPFS Hash</div>
          <div className="break-all text-purple-200">{ipfsHash}</div>
        </div>
      )}

      {txHash && (
        <div className="rounded-lg bg-gray-800/70 p-3 text-xs text-gray-200">
          <div className="font-semibold">Transaction</div>
          <div className="break-all text-green-300">{txHash}</div>
        </div>
      )}
    </div>
  );
}
