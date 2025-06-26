'use client';

import React from 'react';
import { motion } from 'framer-motion';
import NFTCollectionDetailPage from '@/mainpages/NFTCollectionDetailPage';

interface CollectionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ params }) => {
  const resolvedParams = React.use(params);

  return (
    <motion.div 
      className="min-h-screen bg-primary-light dark:bg-primary-dark relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced cyber ambient effects for detail page */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.06) 0%, transparent 60%)",
            "radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.04) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)",
            "radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.06) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Animated gradient lines */}
      <motion.div
        className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="fixed bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Detailed grid pattern */}
      <motion.div
        className="fixed inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none z-0"
        animate={{
          backgroundPosition: ["0px 0px", "40px 40px"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10">
        <NFTCollectionDetailPage id={resolvedParams.id} />
    </div>
    </motion.div>
  );
};

export default CollectionDetailPage;
