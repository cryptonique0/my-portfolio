import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";
import { AppHeader } from "./top-nav";

export const metadata: Metadata = {
  title: "On-Chain Resume | Base + Stacks",
  description: "Create, verify, and showcase your on-chain resume across Base and Stacks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">{children}</main>
            <footer className="border-t border-white/10 py-6 text-sm text-slate-400 text-center">
              Built for Base + Stacks | On-chain resumes, verifiable credentials, and achievement badges.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
