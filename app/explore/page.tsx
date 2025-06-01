'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ExploreNFTPage from '@/mainpages/ExploreNFTPage';

const ExplorePage = () => {
  return (
    <motion.div 
      className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] bg-white dark:bg-primary-dark relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Cyber ambient effects */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.04) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Subtle grid pattern */}
      <motion.div
        className="fixed inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none z-0"
        animate={{
          backgroundPosition: ["0px 0px", "100px 100px"],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10">
        <ExploreNFTPage />
      </div>
    </motion.div>
  );
};

export default ExplorePage;
