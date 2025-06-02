import React, { useRef, useState } from "react";
import { formatEther } from 'viem';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { CollectionDetail } from '../lib/types';
import { useCurrency } from '@/context/CurrencyContext'; // Re-enabled with hydration guards
import { usePreservedNavigation } from '@/hooks/usePreservedNavigation';

const CollectionCard = ({ collection }: { collection: CollectionDetail }) => {
  const { formatPriceWithConversion } = useCurrency(); // Re-enabled
  const { navigateToCollection } = usePreservedNavigation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  
  // Enhanced 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCardClick = () => {
    navigateToCollection(collection.collectionId.toString());
  };
  
  // Enhanced price formatting with currency conversion
  const formatDisplayPrice = (priceInWei?: bigint): string => {
    if (!collection.isListed || typeof priceInWei === 'undefined' || priceInWei === 0n) return "Not Listed";
    const priceInEth = parseFloat(formatEther(priceInWei));
    return formatPriceWithConversion(priceInEth);
  }

  const displayCreator = (address?: string) => { 
    if (!address || address === "0x0000000000000000000000000000000000000000") return "Unknown Creator";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  const formatCollectionName = (name?: string): string => {
    if (!name) return 'Untitled Collection';
    
    // Remove "Collection: " or "collection: " prefix (case insensitive)
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('collection: ')) {
      return name.substring('collection: '.length).trim();
    }
    
    return name;
  };

  return (
    <div className="block group cursor-pointer" onClick={handleCardClick}>
      {/* Floating container with enhanced animations */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: { 
            duration: 4,
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 2
          }
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        className="w-full h-full"
      >
        {/* Card container with 3D tilt */}
        <motion.div
          ref={cardRef}
          className="relative z-10 border border-black/20 dark:border-white/20 rounded-cyber-lg h-full bg-gray-50/95 dark:bg-primary-dark/95 backdrop-blur-cyber overflow-hidden group transition-all duration-500"
          style={{
            transformStyle: "preserve-3d",
            rotateX: rotateX,
            rotateY: rotateY,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ 
            borderColor: "rgba(0, 0, 0, 0.8)",
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)",
            scale: 1.02
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Enhanced cyber scan line effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent opacity-0 group-hover:opacity-100 z-30"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Animated gradient background with enhanced effects */}
          <motion.div
            className="absolute inset-0 opacity-10 dark:opacity-15 rounded-cyber-lg"
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.4) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(0, 0, 0, 0.35) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.4) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Enhanced aura glow effect */}
          <motion.div
            className="absolute inset-0 rounded-cyber-lg pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.4), transparent 70%)",
              filter: "blur(30px)",
              zIndex: -1,
              opacity: 0,
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Image Section with better blending */}
          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-black/10 dark:via-black/5 rounded-t-cyber-lg">
            {/* Enhanced image overlay gradient for better blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 via-gray-50/30 to-transparent dark:from-primary-dark/90 dark:via-primary-dark/30 opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10"></div>
            
            {/* Additional blend overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/10 dark:via-white/5 dark:to-white/10 z-5"></div>
            
            {/* Image or Placeholder */}
            {collection.image && !imageError ? (
              <motion.img
                src={collection.image}
                alt={collection.name || 'Collection Image'}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                whileHover={{ 
                  filter: "brightness(1.2) contrast(1.1) saturate(1.1)",
                }}
                onError={() => setImageError(true)}
              />
            ) : (
              <motion.div
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative"
                whileHover={{ 
                  scale: 1.02,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Cyber grid background */}
                <motion.div
                  className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
                  animate={{
                    backgroundPosition: ["0px 0px", "30px 30px"],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px'
                  }}
                />
                
                {/* Central content */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* No Image Icon with cyber styling */}
                  <motion.div
                    animate={{ 
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-4 p-4 rounded-cyber border border-gray-300/50 dark:border-gray-600/50 bg-white/20 dark:bg-black/20 backdrop-blur-sm"
                  >
                    <svg 
                      className="w-8 h-8 text-gray-500 dark:text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                  </motion.div>
                  
                  {/* No Image Text with cyber styling */}
                  <motion.p 
                    className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center px-6 font-semibold"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      textShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Image Not Found
                  </motion.p>
                  
                  {/* Subtle scanning line effect */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400/60 dark:via-gray-500/60 to-transparent"
                    animate={{
                      y: [0, 200, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                {/* Corner decorations for cyber effect */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-400/30 dark:border-gray-500/30"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-400/30 dark:border-gray-500/30"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-gray-400/30 dark:border-gray-500/30"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-gray-400/30 dark:border-gray-500/30"></div>
              </motion.div>
            )}
            
            {/* Collection availability badge - all collections are open for bids */}
            {collection.listingPrice && collection.listingPrice > 0 && ( 
              <motion.div 
                className="absolute top-4 right-4 z-20"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.1, rotate: 2 }}
              >
                <div className="px-3 py-1.5 bg-gradient-to-r from-white/90 to-white/80 dark:from-black/90 dark:to-black/80 backdrop-blur-sm text-black dark:text-white text-xs font-mono font-semibold rounded-cyber border border-black/30 dark:border-white/30 shadow-lg uppercase tracking-wider">
                  <motion.span
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    OPEN TO BIDS
                  </motion.span>
                </div>
              </motion.div>
            )}
            
            {/* Collection ID Badge with enhanced styling */}
            <motion.div 
              className="absolute top-4 left-4 z-20"
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="px-2 py-1 bg-gradient-to-r from-white/70 to-white/60 dark:from-black/70 dark:to-black/60 backdrop-blur-sm text-black dark:text-white text-xs font-mono rounded border border-black/20 dark:border-white/20">
                #{collection.collectionId.toString()}
              </div>
            </motion.div>

            {/* Cyber grid pattern overlay on image */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-15">
              <div className="w-full h-full" 
                   style={{
                     backgroundImage: `
                       linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)
                     `,
                     backgroundSize: '15px 15px'
                   }}>
              </div>
            </div>
          </div>

          {/* Content Section with enhanced styling */}
          <div className="relative p-5 space-y-3 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-primary-dark/50">
            {/* Title and Creator Section - Full Width */}
            <div className="space-y-1">
              <motion.h3 
                className="text-lg font-bold text-black dark:text-white font-mono tracking-tight line-clamp-2 group-hover:text-black dark:group-hover:text-white transition-colors duration-300" 
                title={formatCollectionName(collection.name)}
                style={{
                  textShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
                }}
                whileHover={{
                  textShadow: "0 0 20px rgba(0, 0, 0, 0.8)",
                }}
              >
                {formatCollectionName(collection.name)}
              </motion.h3>
              <p 
                className="text-sm text-black/60 dark:text-white/60 font-mono" 
                title={displayCreator(collection.creator)}
              >
                Creator: {displayCreator(collection.creator)}
              </p>
            </div>

            {/* Price Section - Compact Row */}
            {collection.isListed && typeof collection.price === 'bigint' && (
              <motion.div 
                className="flex items-center justify-between"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-xs text-black/60 dark:text-white/60 font-mono uppercase tracking-wider">
                  Listing Price
                </div>
                <div className="px-2 py-1 bg-gradient-to-br from-white/15 to-white/10 dark:from-black/15 dark:to-black/10 rounded border border-black/20 dark:border-white/20 backdrop-blur-sm">
                  <motion.div 
                    className="text-sm font-bold text-black dark:text-white font-mono"
                    animate={{ 
                      textShadow: [
                        "0 0 10px rgba(0, 0, 0, 0.3)",
                        "0 0 15px rgba(0, 0, 0, 0.5)",
                        "0 0 10px rgba(0, 0, 0, 0.3)",
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {formatDisplayPrice(collection.price)}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Description */}
            {collection.description && (
              <motion.p 
                className="text-sm text-black/70 dark:text-white/70 line-clamp-2 leading-relaxed font-mono pt-1" 
                title={collection.description || 'No description'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {collection.description || 'No description available.'}
              </motion.p>
            )}

            {/* Stats Section with enhanced styling */}
            <div className="flex justify-between items-center pt-3 border-t border-black/20 dark:border-white/20">
              <div className="flex space-x-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-xs text-black/60 dark:text-white/60 font-mono uppercase tracking-wider">Items</div>
                  <motion.div 
                    className="text-sm font-bold text-black dark:text-white font-mono"
                    whileHover={{ scale: 1.1 }}
                  >
                    {collection.totalSupply?.toString() || 'N/A'}
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Enhanced Hover Effect Indicator */}
              <motion.div 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <div className="w-3 h-3 bg-gradient-to-r from-black to-black/80 dark:from-white dark:to-white/80 rounded-full shadow-lg"></div>
              </motion.div>
            </div>

            {/* Enhanced Cyber Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none rounded-cyber-lg">
              <motion.div 
                className="w-full h-full" 
                animate={{
                  backgroundPosition: ["0px 0px", "20px 20px"],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}>
              </motion.div>
            </div>
          </div>

          {/* Enhanced pulse effect with multiple layers */}
          <motion.div
            className="absolute inset-0 rounded-cyber-lg pointer-events-none"
            animate={{
              boxShadow: [
                "inset 0 0 30px rgba(0, 0, 0, 0)",
                "inset 0 0 30px rgba(0, 0, 0, 0.2)",
                "inset 0 0 30px rgba(0, 0, 0, 0)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Additional glow layers for enhanced aura */}
          <motion.div
            className="absolute inset-0 rounded-cyber-lg pointer-events-none opacity-0 group-hover:opacity-100"
            style={{
              background: "linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.1), transparent)",
              filter: "blur(10px)",
            }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default CollectionCard;
