"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Info, Eye, EyeOff } from "lucide-react";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: string;
  highlight?: string[];
  duration: number; // ms
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: "step1",
    title: "Create Your Profile",
    description: "Sign in with your wallet and create your professional profile",
    action: "Click 'Create Profile'",
    highlight: ["profile-button"],
    duration: 3000,
  },
  {
    id: "step2",
    title: "Add Your Credentials",
    description: "Upload your resume to IPFS and add verified credentials",
    action: "Upload Resume",
    highlight: ["resume-upload", "credentials-section"],
    duration: 4000,
  },
  {
    id: "step3",
    title: "Get Verified",
    description: "Trusted verifiers sign your credentials for authenticity",
    action: "Request Verification",
    highlight: ["verification-button"],
    duration: 3000,
  },
  {
    id: "step4",
    title: "Share Your Profile",
    description: "Generate a public verification link anyone can check",
    action: "Get Public Link",
    highlight: ["share-button"],
    duration: 3000,
  },
  {
    id: "step5",
    title: "Build Your Reputation",
    description: "Earn badges and build a reputation score across chains",
    action: "View Dashboard",
    highlight: ["dashboard", "reputation"],
    duration: 3000,
  },
];

interface DemoModeProps {
  onExit?: () => void;
  isOpen?: boolean;
}

export function DemoMode({ onExit, isOpen = false }: DemoModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  const step = DEMO_STEPS[currentStep];
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100;

  const goToStep = (index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, DEMO_STEPS.length - 1)));
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-effect border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Play className="w-6 h-6" />
            Interactive Demo
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Learn how to build your on-chain professional identity in 5 steps
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                Step {currentStep + 1} of {DEMO_STEPS.length}
              </p>
              <p className="text-sm text-gray-400">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                layout
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Display */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full mb-3">
                <p className="text-xs font-semibold text-blue-300">
                  Step {currentStep + 1}
                </p>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </div>

            {/* Action Call-out */}
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm text-gray-400">Next Action:</p>
              <p className="text-lg font-semibold text-purple-300">{step.action}</p>
            </div>

            {/* Demo Illustration (placeholder) */}
            <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">
                    {currentStep === 0
                      ? "👤"
                      : currentStep === 1
                        ? "📄"
                        : currentStep === 2
                          ? "✓"
                          : currentStep === 3
                            ? "🔗"
                            : "📊"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Demo content for: {step.title}</p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
              title="Reset to start"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Step Buttons */}
            <div className="flex-1 flex gap-1">
              {DEMO_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`flex-1 h-2 rounded-full transition ${
                    index === currentStep
                      ? "bg-blue-500 scale-y-150"
                      : index < currentStep
                        ? "bg-green-500"
                        : "bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
              title={showGuide ? "Hide guide" : "Show guide"}
            >
              {showGuide ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              ← Previous
            </button>
            {currentStep < DEMO_STEPS.length - 1 ? (
              <button
                onClick={() => goToStep(currentStep + 1)}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => {
                  onExit?.();
                }}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Let's Get Started! 🚀
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-blue-500/10 p-4 flex gap-3"
          >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">💡 Pro Tip</p>
              <p>
                {currentStep === 0 &&
                  "Your wallet is your identity on-chain. You maintain full control."}
                {currentStep === 1 &&
                  "Uploading to IPFS means your resume lives on decentralized storage."}
                {currentStep === 2 &&
                  "Verifiers independently confirm your credentials for authenticity."}
                {currentStep === 3 &&
                  "Your public link works without requiring others to connect a wallet."}
                {currentStep === 4 &&
                  "Reputation scores are calculated transparently on-chain."}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Demo Mode Toggle Button (for navbar/header)
 */
export function DemoModeButton() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDemo(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
      >
        <Play className="w-4 h-4" />
        <span className="hidden sm:inline">Demo</span>
      </button>
      {showDemo && <DemoMode onExit={() => setShowDemo(false)} isOpen={showDemo} />}
    </>
  );
}
