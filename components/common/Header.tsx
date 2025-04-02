"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FaBars,
  FaEthereum,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { navItems } from "@/lib/data";
import { usePathname } from "next/navigation";
import AnimatedButton from "./AnimatedButton";

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

const Header = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.addEventListener("scroll", handleScroll);
  }, []);
  const handleWallet = (isConnect: boolean) => {
    setWalletConnected(isConnect);
    setWalletAddress(isConnect ? "0x7f...3a4b" : "");
  };
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-900 shadow-lg" : "transparent"
      }`}
    >
      <div className="container mx-auto py-3">
        <div className="flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex justify-center space-x-2">
              <FaEthereum className="text-purple-500 text-2xl" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                NFT Market
              </span>
            </Link>
          </motion.div>

          {/* desktop navigation  */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index: number) => (
              <Link
                href={item.path}
                key={index}
                className={`relative px-2 py-1 text-sm font-medium ${
                  pathname == item.path
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-white"
                } transition-colors`}
              >
                {item.name}
                {pathname == item.path && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-500"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* auth action  */}
          <div className="hidden md:flex items-center space-x-4">
            {walletConnected ? (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <FaWallet className="text-purple-400" />
                <span className="text-sm text-gray-200">{walletAddress}</span>
                <button
                  onClick={() => handleWallet(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </motion.div>
            ) : (
              <AnimatedButton
                onClick={handleWallet}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
                isConnect={true}
              >
                <FaWallet />
                <span>Connect</span>
              </AnimatedButton>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500">
                <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
              </div>
              <span className="text-sm text-gray-300 hidden lg:inline">
                Account
              </span>
            </motion.div>
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>
        {/* mobile menu   */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  height: "auto",
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                },
                closed: {
                  height: 0,
                  opacity: 0,
                  transition: {
                    duration: 0.2,
                    ease: "easeIn",
                  },
                },
              }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-6 space-y-4">
                {navItems.map((item) => (
                  <motion.div
                    key={item.name}
                    variants={mobileMenuVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <Link
                      href={item.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === item.path
                          ? "bg-gray-800 text-purple-400"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="md:hidden pt-4 border-t border-gray-700 space-y-4">
            {walletConnected ? (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <FaWallet className="text-purple-400" />
                <span className="text-sm text-gray-200">{walletAddress}</span>
                <button
                  onClick={() => handleWallet(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </motion.div>
            ) : (
              <AnimatedButton
                onClick={handleWallet}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
                isConnect={true}
              >
                <FaWallet />
                <span>Connect</span>
              </AnimatedButton>
            )}

            <motion.div
              variants={mobileMenuVariants}
              className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500">
                  <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                </div>
                <span className="text-gray-200">Account</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                <FaSignOutAlt />
              </button>
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
