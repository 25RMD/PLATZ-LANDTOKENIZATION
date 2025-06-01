"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use actual icons based on resolvedTheme
  const Icon = resolvedTheme === "dark" ? FiSun : FiMoon;

  // Return null until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-cyber border border-black/20 dark:border-white/20 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 hover:border-black/40 dark:hover:border-white/40 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10 group"
    >
      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" /> 
    </button>
  );
};

export default ThemeSwitcher;