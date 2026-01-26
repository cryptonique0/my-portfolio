"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize how SpendGuard looks on your device
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium mb-3">Theme</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme */}
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              theme === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-sm font-medium">Light</span>
            {theme === "light" && (
              <span className="text-xs text-primary font-semibold">Active</span>
            )}
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              theme === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-sm font-medium">Dark</span>
            {theme === "dark" && (
              <span className="text-xs text-primary font-semibold">Active</span>
            )}
          </button>

          {/* System Theme */}
          <button
            onClick={() => setTheme("system")}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              theme === "system"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Monitor className="w-6 h-6" />
            <span className="text-sm font-medium">System</span>
            {theme === "system" && (
              <span className="text-xs text-primary font-semibold">Active</span>
            )}
          </button>
        </div>
      </div>

      {/* Color Scheme Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Your theme preference is saved locally. The system theme will automatically match your device settings.
        </p>
      </div>

      {/* Accessibility Options */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-4">Accessibility</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded border border-border"
          />
          <span className="text-sm">Reduce motion & animations</span>
        </label>
      </div>
    </div>
  );
}
