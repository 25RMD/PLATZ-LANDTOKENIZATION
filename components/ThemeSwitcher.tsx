"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use actual icons based on resolvedTheme
  const Icon = resolvedTheme === "dark" ? FaSun : FaMoon;

  // Return null until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      // Use border, transparent bg, black/white icon, subtle gray hover bg
      className="p-2 rounded-lg border border-black dark:border-white text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors duration-200"
    >
      {/* Use the actual icon component */}
      <Icon className="w-4 h-4" /> 
    </button>
  );
};

export default ThemeSwitcher;