"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ChainSelector } from "@/components/ChainSelector";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile/create", label: "Create Profile" },
  { href: "/credentials", label: "Credentials" },
  { href: "/achievements", label: "Achievements" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg">
              CV
            </div>
            <div>
              <div className="font-semibold text-lg">On-Chain Resume</div>
              <div className="text-xs text-slate-400">Base + Stacks</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-2 ml-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ChainSelector className="hidden sm:block" />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
