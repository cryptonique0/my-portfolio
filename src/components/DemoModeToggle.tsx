"use client";

import { motion } from "framer-motion";
import { useDemo } from "@/providers/DemoProvider";
import { useState } from "react";

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemo();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDemoMode}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          isDemoMode
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
            : "bg-white/10 text-gray-300 hover:bg-white/20"
        }`}
      >
        {isDemoMode ? "🎮 Demo Mode On" : "🎮 Try Demo"}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-0 bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50"
        >
          {isDemoMode
            ? "Demo mode enabled - try create/verify actions"
            : "Click to enable demo mode with pre-filled data"}
        </motion.div>
      )}
    </motion.div>
  );
}
