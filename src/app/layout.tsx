import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Providers } from "./providers";
import { AppHeader } from "./top-nav";

export const metadata: Metadata = {
  title: "On-Chain Resume | Base + Stacks",
  description: "Create, verify, and showcase your on-chain resume across Base and Stacks.",
  authors: [{ name: "Talent Resume Team" }],
  keywords: ["Web3", "Resume", "Credentials", "Blockchain", "Base", "Stacks"],
  openGraph: {
    type: "website",
    url: "https://talent-resume.app",
    title: "On-Chain Resume | Base + Stacks",
    description: "Create, verify, and showcase your on-chain resume across Base and Stacks.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {children}
            </main>
            <footer className="mt-auto border-t border-white/10 py-6 px-4 sm:px-6 text-xs sm:text-sm text-slate-400 text-center">
              <p>Built for Base + Stacks | On-chain resumes, verifiable credentials, and achievement badges.</p>
              <p className="mt-2 text-slate-500">© 2026 Talent Resume. All rights reserved.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
