"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { ThemeProvider } from "./contexts/ThemeContext";
import "@coinbase/onchainkit/styles.css";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: { mode: "auto" },
        wallet: { display: "modal", preference: "all" },
      }}
      miniKit={{ enabled: true, autoConnect: true, notificationProxyUrl: undefined }}
    >
      <ThemeProvider>
        <SafeArea>{children}</SafeArea>
      </ThemeProvider>
    </OnchainKitProvider>
  );
}
