"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  demoProfile: {
    handle: string;
    name: string;
    bio: string;
    credentials: string[];
  };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleDemoMode = () => setIsDemoMode(!isDemoMode);

  const demoProfile = {
    handle: "jane-smith",
    name: "Jane Smith",
    bio: "Full Stack Developer | Web3 Enthusiast | Building the future",
    credentials: [
      "Senior Frontend Engineer at TechCorp",
      "BS Computer Science from Stanford",
      "AWS Solutions Architect Certification",
    ],
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode, demoProfile }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return context;
}
