"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedButton from "@/components/common/AnimatedButton";

const HomePage = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2"
      >
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Discover, Collect & Sell{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Extraordinary NFTs
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Explore the best digital art and collectibles on the most animated NFT
          marketplace on the blockchain.
        </p>

        <div className="flex gap-4">
          <Link href="/marketplace" passHref>
            <AnimatedButton>Explore</AnimatedButton>
          </Link>
          <Link href="/create" passHref>
            <AnimatedButton variant="outline">Create</AnimatedButton>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="lg:w-1/2"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-24"
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Featured Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Collection {index + 1}
                </h3>
                <p className="text-gray-400 mb-4">
                  Amazing digital art collection
                </p>
                <Link
                  href="/marketplace"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Collection →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
