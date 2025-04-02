"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaEthereum } from "react-icons/fa";
import { footerLinks, socialLinks } from "@/lib/data";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-gray-900 text-gray-300 border-t border-gray-800"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <FaEthereum className="text-purple-500 text-2xl" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                NFT Market
              </span>
            </Link>
            <p className="text-gray-400">
              The world's first and largest digital marketplace for crypto
              collectibles and non-fungible tokens (NFTs).
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social, index: number) => (
                <Link
                  href={social.url}
                  key={index}
                  target="_blank"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="text-xl" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* footer links  */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links?.map((link, ind) => (
                  <motion.li
                    key={ind}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href={link.url}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* bottom section  */}
        <motion.div
          variants={itemVariants}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 mb-4 md:mb-0">
            © {currentYear} NFT Market. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              className="text-gray-500 hover:text-gray-300 transition-colors"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-gray-500 hover:text-gray-300 transition-colors"
              href="/terms"
            >
              Terms of Service
            </Link>
            <Link
              className="text-gray-500 hover:text-gray-300 transition-colors"
              href="/cookies"
            >
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
