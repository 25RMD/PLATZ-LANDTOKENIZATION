"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    console.log("ThemeSwitcher: Component has mounted.");
    setMounted(true);
  }, []);

  const handleThemeChange = () => {
    console.log("ThemeSwitcher: onClick event triggered.");
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log(`ThemeSwitcher: Changing theme to ${newTheme}`);
    setTheme(newTheme);
  };

  // Use actual icons based on theme
  // Use actual icons based on resolvedTheme
  const Icon = theme === "dark" ? FiSun : FiMoon;

  // Return null until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={handleThemeChange}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="p-2 rounded-cyber border border-black/20 dark:border-white/20 text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 hover:border-black/40 dark:hover:border-white/40 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10 group"
    >
      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
};

export default ThemeSwitcher;