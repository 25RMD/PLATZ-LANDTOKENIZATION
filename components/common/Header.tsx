"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FaBars,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { IoMapOutline } from "react-icons/io5";
import { navItems } from "@/lib/data";
import { usePathname } from "next/navigation";
import AnimatedButton from "./AnimatedButton";
import ThemeSwitcher from "../ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';

const mobileMenuVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Variants for account menu popup
const accountMenuVariants = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isVerified, user, logout, isLoading: authLoading } = useAuth();

  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  // Get isAdmin status from context
  const { isAdmin } = useAuth(); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuRef]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-[25px] w-full z-50 px-2 sm:px-4"
    >
      <div className="relative h-16 flex items-center justify-between px-3 sm:px-4 container mx-auto bg-primary-light dark:bg-primary-dark rounded-xl border border-black/10 dark:border-white/10 shadow-lg max-w-7xl">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
          <Link href="/" className="flex justify-center space-x-2 items-center">
            <IoMapOutline className="text-text-light dark:text-text-dark text-xl sm:text-2xl" />
            <span className="text-sm sm:text-base font-bold text-text-light dark:text-text-dark uppercase">
              Platz
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <ul className="flex space-x-4 xl:space-x-6">
            {navItems
              .filter(item => item.path !== '/create-nft' || isVerified)
               .map((item, index: number) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`relative px-1 py-1 text-sm xl:text-base font-medium uppercase whitespace-nowrap ${
                      pathname == item.path
                        ? "text-text-light dark:text-text-dark"
                        : "text-text-light dark:text-text-dark opacity-60 hover:opacity-100"
                    } transition-opacity duration-200`}
                  >
                    {item.name}
                    {pathname == item.path && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute left-0 bottom-0 w-full h-0.5 bg-text-light dark:bg-text-dark"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-shrink-0">
          <ThemeSwitcher />
          
          {isConnected ? (
            <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg min-w-0">
              <FaWallet className="text-text-light dark:text-text-dark flex-shrink-0" />
              <span className="text-xs text-text-light dark:text-text-dark truncate max-w-[80px] xl:max-w-[120px]">
                {ensName ? `${ensName} (${address?.slice(0,4)}...${address?.slice(-4)})` : `${address?.slice(0,6)}...${address?.slice(-4)}`}
              </span>
              {connector && <span className="text-xs text-gray-500 hidden xl:inline">({connector.name})</span>}
              <button 
                onClick={() => disconnect()} 
                className="ml-2 text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                title="Disconnect Wallet"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <AnimatedButton 
              onClick={() => connect({ connector: connectors[0] })} 
              className="flex items-center space-x-2 text-sm whitespace-nowrap"
            >
              <FaWallet />
              <span className="hidden xl:inline">Connect Wallet</span>
              <span className="xl:hidden">Connect</span>
            </AnimatedButton>
          )}

          {/* Show loading placeholder ONLY if loading AND not already authenticated */}
          {authLoading && !isAuthenticated ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse flex-shrink-0"></div>
          ) : isAuthenticated ? (
            <div className="relative flex-shrink-0" ref={accountMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                aria-label="Account options"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-black dark:border-white">
                  <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center">
                    <FaUser className="text-white dark:text-black" />
                  </div>
                </div>
              </motion.button>

              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={accountMenuVariants}
                    className="absolute top-full right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-primary-light dark:bg-primary-dark ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 focus:outline-none z-10"
                  >
                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
                        <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                          {user?.username || "Account"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || (isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : 'No wallet')} {isAdmin && <span className="font-bold text-blue-500">(Admin)</span>}
                        </p>
                      </div>
                      <div className="py-1">
                        {isAdmin ? (
                          <Link
                            href="/admin/dashboard"
                            className="block w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            role="menuitem"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        ) : (
                          <>
                        {[
                          { name: 'Profile', href: '/profile' },
                          { name: 'My Listings', href: '/my-listings' },
                          { name: 'Watchlist', href: '/watchlist' },
                          { name: 'Orders', href: '/orders' },
                        ].map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            role="menuitem"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                          </>
                        )}
                      </div>
                      <div className="border-t border-gray-200 dark:border-zinc-700 py-1">
                        <button
                          onClick={async () => {
                            setIsAccountMenuOpen(false);
                            await logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          role="menuitem"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link 
                href="/login"
                className="text-text-light dark:text-text-dark border border-black/20 dark:border-white/20 rounded-md px-3 xl:px-4 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition text-sm whitespace-nowrap">
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-text-light dark:text-text-dark hover:opacity-80 focus:outline-none flex-shrink-0 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="lg:hidden absolute top-full left-0 right-0 mt-2 w-full rounded-lg overflow-hidden bg-primary-light dark:bg-primary-dark shadow-lg border border-black/10 dark:border-white/10"
            >
              <div className="pt-4 pb-6 space-y-1 px-2">
                {/* Navigation Links */}
                {navItems
                  .filter(item => item.path !== '/create-nft' || isVerified)
                  .map((item) => (
                  <motion.div
                    key={item.name}
                  >
                    <Link
                      href={item.path}
                      className={`block px-3 py-3 rounded-md text-base font-medium uppercase ${
                        pathname === item.path
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-800"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Actions Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-4 px-3">
                  {/* Theme Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">Theme</span>
                    <ThemeSwitcher />
                  </div>
                  
                  {/* Wallet Connection */}
                  <div className="space-y-3">
                    {isConnected ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <FaWallet className="text-text-light dark:text-text-dark flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs text-text-light dark:text-text-dark truncate">
                                {ensName ? `${ensName}` : `${address?.slice(0,8)}...${address?.slice(-6)}`}
                              </div>
                              {connector && <div className="text-xs text-gray-500">({connector.name})</div>}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              disconnect();
                              setMobileMenuOpen(false);
                            }} 
                            className="ml-2 text-sm text-red-500 hover:text-red-700 flex-shrink-0 p-1"
                            title="Disconnect Wallet"
                          >
                            <FaSignOutAlt />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <AnimatedButton 
                        onClick={() => {
                          connect({ connector: connectors[0] });
                          setMobileMenuOpen(false);
                        }} 
                        className="w-full flex items-center justify-center space-x-2 py-3"
                      >
                        <FaWallet />
                        <span>Connect Wallet</span>
                      </AnimatedButton>
                    )}
                  </div>

                  {/* User Account Section */}
                  {authLoading && !isAuthenticated ? (
                    <div className="h-12 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse"></div>
                  ) : isAuthenticated ? (
                    <div className="space-y-2">
                      {/* User Profile Header */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-black dark:border-white flex-shrink-0">
                          <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center">
                            <FaUser className="text-white dark:text-black" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                            {user?.username || "Account"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || (isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : 'No wallet')}
                            {isAdmin && <span className="font-bold text-blue-500 ml-1">(Admin)</span>}
                          </div>
                        </div>
                      </div>

                      {/* Profile Menu Items */}
                      <div className="space-y-1">
                        {isAdmin ? (
                          <Link
                            href="/admin/dashboard"
                            className="block w-full text-left px-3 py-2 rounded-md text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        ) : (
                          <>
                            {[
                              { name: 'Profile', href: '/profile' },
                              { name: 'My Listings', href: '/my-listings' },
                              { name: 'Watchlist', href: '/watchlist' },
                              { name: 'Orders', href: '/orders' },
                            ].map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="block w-full text-left px-3 py-2 rounded-md text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </>
                        )}
                        
                        {/* Sign Out Button */}
                        <button
                          onClick={async () => {
                            setMobileMenuOpen(false);
                            await logout();
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="text-sm font-medium">Sign Out</span>
                          <FaSignOutAlt />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link 
                        href="/login"
                        className="block w-full text-center text-text-light dark:text-text-dark border border-black/20 dark:border-white/20 rounded-md px-4 py-3 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition"
                        onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
