"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import AnimatedButton from "@/components/common/AnimatedButton";
import GlobeAnimation from "@/components/three/GlobeAnimation";
import { 
  FiPieChart, 
  FiRepeat, 
  FiCheckSquare, 
  FiGlobe, 
  FiLock, 
  FiUserCheck, 
  FiCpu, 
  FiBarChart2 
} from "react-icons/fi"; // Icons for features/how-it-works

// Enhanced fade-in animation for sections with parallax
const FadeInSection = ({ 
  children, 
  className = "",
  delay = 0
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 1, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother motion
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Enhanced 3D Card component with floating and tilt effects
const Card3D = ({ 
  children, 
  front, 
  back, 
  index,
  className = ""
}: { 
  children?: React.ReactNode;
  front: React.ReactNode;
  back: React.ReactNode;
  index: number;
  className?: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return; // Don't tilt when flipped
    
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

  return (
    <motion.div
      ref={cardRef}
      className={`relative h-full cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Floating container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: { 
            duration: 3 + index * 0.2,
            repeat: Infinity, 
            ease: "easeInOut",
            delay: index * 0.3
          }
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        className="w-full h-full"
      >
        {/* Card container with tilt */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 0 : rotateY,
          }}
        >
          {/* Flip container */}
          <motion.div
            className="relative w-full h-full"
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Card Front */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
              {front}
            </div>
            
            {/* Card Back */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              {back}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Enhanced animated glow effect - Light mode */}
      <motion.div
        className="absolute inset-0 rounded-cyber-lg pointer-events-none dark:hidden"
        style={{
          background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.4), transparent 70%)",
          filter: "blur(30px)",
          zIndex: -1,
          opacity: 0,
        }}
        whileHover={{ opacity: isFlipped ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
      {/* Dark mode glow effect */}
      <motion.div
        className="absolute inset-0 rounded-cyber-lg pointer-events-none dark:block hidden"
        style={{
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.3), transparent 70%)",
          filter: "blur(30px)",
          zIndex: -1,
          opacity: 0,
        }}
        whileHover={{ opacity: isFlipped ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Animated icon component
const AnimatedIcon = ({ Icon, className = "" }: { Icon: any; className?: string }) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.2,
        rotate: 360,
        transition: { duration: 0.5 }
      }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
};

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-primary-dark relative overflow-hidden">
      {/* Enhanced Cyber background pattern */}
      <motion.div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none z-0"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}
      />

      {/* --- Enhanced Hero Section with 3D Globe --- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative text-center h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex flex-col justify-center px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden"
        style={{ perspective: 800 }}
      >
        {/* Enhanced cyber background effects */}
        <motion.div
          className="absolute inset-0 opacity-10 dark:opacity-15"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(0, 0, 0, 0.25) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* 3D Globe Background - Fixed positioning */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] md:w-[800px] md:h-[800px]">
            <GlobeAnimation className="opacity-60 dark:opacity-50" />
          </div>
        </div>

        {/* Enhanced Content Layer */}
        <div className="relative z-20">
        <motion.h1 
          className="
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
              font-bold font-mono uppercase tracking-wider
            leading-tight sm:leading-tight md:leading-tight lg:leading-tight
              text-black dark:text-white
            mb-4 sm:mb-6 max-w-4xl mx-auto
          "
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0],
            }}
            transition={{ 
              opacity: { duration: 1, delay: 1 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            style={{
              textShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
            }}
          >
            TOKENIZE YOUR LAND, UNLOCK GLOBAL OPPORTUNITY
        </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-black/80 dark:text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 font-mono"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          >
          Transform your property into digital tokens. Enable fractional ownership and global liquidity for your assets.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
          >
            <Link href="/explore">
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 0, 0, 0.4)" }} 
                whileTap={{ scale: 0.95 }}
              >
                <AnimatedButton className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white hover:bg-black/90 dark:hover:bg-white/90 px-6 sm:px-8 py-3 font-mono uppercase tracking-wider rounded-cyber shadow-[0_0_20px_rgba(0,0,0,0.3)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  GET STARTED
              </AnimatedButton>
            </motion.div>
          </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* --- Enhanced Features Section --- */}
      <FadeInSection className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 py-16 sm:py-20 md:py-24 lg:py-32">
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-8 sm:mb-12 text-center"
          style={{
            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
          animate={{
            textShadow: [
              "0 0 20px rgba(0, 0, 0, 0.5)",
              "0 0 30px rgba(0, 0, 0, 0.8)",
              "0 0 20px rgba(0, 0, 0, 0.5)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          FEATURES
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 [perspective:1000px]">
          {[ // Feature data
            { icon: FiPieChart, title: "Fractional Ownership", description: "Each token represents a fractional share of your property, lowering the entry barrier for investors." },
            { icon: FiRepeat, title: "Enhanced Liquidity", description: "Trade tokens 24/7 on blockchain-based marketplaces for near-instant transactions." },
            { icon: FiCheckSquare, title: "Automated Compliance", description: "Built-in smart contracts automate KYC/AML and regulatory compliance." },
            { icon: FiGlobe, title: "Global Market Access", description: "Open your land to a global pool of investors, unrestricted by geography." },
            { icon: FiLock, title: "Secure Title Management", description: "Immutable blockchain records ensure tamper-proof property rights and transparent histories." },
          ].map((feature, index) => (
            <div key={index} className="min-h-[300px] h-full">
              <Card3D 
                index={index}
                front={
                  <motion.div 
                    className="relative z-10 p-4 sm:p-6 border border-black/40 dark:border-white/40 rounded-cyber-lg h-full min-h-[280px] bg-gray-50/95 dark:bg-primary-dark/95 backdrop-blur-cyber overflow-hidden group flex flex-col card-hover-effect"
                    whileHover={{ 
                      borderColor: "rgba(0, 0, 0, 0.8)",
                      boxShadow: "0 0 40px rgba(0, 0, 0, 0.3)"
                    }}
                    transition={{ duration: 0.3 }}
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
                    
                    {/* Enhanced animated gradient background */}
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
                    
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-grow">
                      <AnimatedIcon 
                        Icon={feature.icon} 
                        className="text-2xl sm:text-3xl text-black dark:text-white mb-3 sm:mb-4"
                      />
                      
                      <motion.h3 
                        className="text-lg sm:text-xl font-semibold font-mono uppercase tracking-wider text-black dark:text-white mb-2"
                        style={{
                          textShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        {feature.title}
                      </motion.h3>
                      
                      <p className="text-sm sm:text-base text-black/70 dark:text-white/70 relative z-10 font-mono flex-grow">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                }
                back={
                  <motion.div 
                    className="p-4 sm:p-6 border border-black/50 dark:border-white/50 rounded-cyber-lg h-full min-h-[280px] bg-gradient-to-br from-black/10 dark:from-white/10 to-black/5 dark:to-white/5 backdrop-blur-cyber flex flex-col justify-center items-center"
                    animate={{
                      borderColor: ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.3)"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: "conic-gradient(from 0deg, transparent, rgba(0, 0, 0, 0.3), transparent)",
                      }}
                    />
                    
                    <h3 className="text-lg sm:text-xl font-semibold font-mono uppercase tracking-wider text-black dark:text-white mb-2 text-center relative z-10">
                      {feature.title}
                    </h3>
                    
                    <motion.button
                      className="mt-4 px-4 py-2 border border-black/50 dark:border-white/50 rounded-cyber text-sm text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative z-10 font-mono uppercase tracking-wider"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      LEARN MORE →
                    </motion.button>
                  </motion.div>
                }
              />
            </div>
          ))}
        </div>
      </FadeInSection>

      {/* --- Enhanced How It Works Section --- */}
      <FadeInSection className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 py-16 sm:py-20 md:py-24 lg:py-32" delay={0.2}>
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-8 sm:mb-12 text-center"
          style={{
            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          HOW IT WORKS
        </motion.h2>
        
        <div className="relative">
          {/* Enhanced animated connection line for desktop */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.8) 20%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 80%, transparent)",
              transformOrigin: "left",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 [perspective:1000px] relative">
            {[ // Steps data
              { icon: FiUserCheck, title: "1. Verify & Onboard", description: "Upload your title deeds and complete our secure KYC process to verify property ownership." },
              { icon: FiCpu, title: "2. Tokenize Asset", description: "Smart contracts mint digital tokens representing your land's equity, ready for distribution." },
              { icon: FiBarChart2, title: "3. Trade & Manage", description: "List tokens on integrated exchanges, track ownership, and receive dividends automatically." },
            ].map((step, index) => (
              <div key={index} className="relative min-h-[350px] h-full">
                {/* Enhanced step number badge */}
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-black dark:from-white to-black/80 dark:to-white/80 rounded-full flex items-center justify-center text-white dark:text-black font-bold text-lg z-20 font-mono border-2 border-black/50 dark:border-white/50"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  style={{
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {index + 1}
                </motion.div>
                
                <Card3D 
                  index={index}
                  front={
                    <motion.div 
                      className="relative z-10 p-4 sm:p-6 border-2 border-black/50 dark:border-white/50 rounded-cyber-lg h-full min-h-[320px] bg-gray-50/95 dark:bg-primary-dark/95 backdrop-blur-cyber overflow-hidden group flex flex-col card-step-hover-effect"
                      whileHover={{ 
                        borderColor: "rgba(0, 0, 0, 0.8)",
                        boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Enhanced pulse effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-cyber-lg"
                        animate={{
                          boxShadow: [
                            "inset 0 0 30px rgba(0, 0, 0, 0)",
                            "inset 0 0 30px rgba(0, 0, 0, 0.2)",
                            "inset 0 0 30px rgba(0, 0, 0, 0)",
                          ],
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                      />
                      
                      <div className="flex flex-col items-center text-center flex-grow">
                        <AnimatedIcon 
                          Icon={step.icon} 
                          className="text-3xl sm:text-4xl text-black dark:text-white mb-4 sm:mb-5"
                        />
                        
                        <motion.h3 
                          className="text-lg sm:text-xl font-semibold font-mono uppercase tracking-wider text-black dark:text-white mb-2"
                          style={{
                            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
                          }}
                        >
                          {step.title}
                        </motion.h3>
                        
                        <p className="text-sm sm:text-base text-black/70 dark:text-white/70 relative z-10 font-mono flex-grow">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  }
                  back={
                    <motion.div 
                      className="p-4 sm:p-6 border border-black/50 dark:border-white/50 rounded-cyber-lg h-full min-h-[320px] bg-gradient-to-br from-black/10 dark:from-white/10 to-black/5 dark:to-white/5 backdrop-blur-cyber flex flex-col justify-center items-center overflow-hidden"
                    >
                      {/* Enhanced animated particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-black dark:bg-white rounded-full"
                          animate={{
                            x: [0, Math.random() * 200 - 100],
                            y: [0, Math.random() * 200 - 100],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeOut",
                          }}
                          style={{
                            left: "50%",
                            top: "50%",
                          }}
                        />
                      ))}
                      
                      <h3 className="text-lg sm:text-xl font-semibold font-mono uppercase tracking-wider text-black dark:text-white mb-2 text-center relative z-10">
                        {step.title}
                      </h3>
                      
                      <div className="mt-4 space-y-2 text-sm text-black dark:text-white relative z-10 font-mono">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ✓ SECURE PROCESS
                        </motion.div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                        >
                          ✓ FAST EXECUTION
                        </motion.div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                        >
                          ✓ FULL SUPPORT
                        </motion.div>
                      </div>
                    </motion.div>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* --- Enhanced About Us Section --- */}
      <FadeInSection className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center relative z-10 py-16 sm:py-20 md:py-24 lg:py-32" delay={0.3}>
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-6 sm:mb-8"
          style={{
            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          ABOUT US
        </motion.h2>
        
        <motion.div 
          className="max-w-3xl mx-auto p-8 border border-black/40 dark:border-white/40 rounded-cyber-lg bg-gray-50/95 dark:bg-primary-dark/95 backdrop-blur-cyber"
          whileHover={{ 
            borderColor: "rgba(0, 0, 0, 0.4)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.2)"
          }}
        >
          <div className="space-y-4 text-base sm:text-lg text-black/80 dark:text-white/80 font-mono">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
            At Platz, our mission is to democratize real estate ownership by leveraging blockchain technology.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
            Founded by experts in property law and decentralized finance, we bridge traditional land registries with innovative digital solutions.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
            We are committed to transparency, security, and regulatory compliance in every step.
            </motion.p>
        </div>
        </motion.div>
      </FadeInSection>

      {/* --- Enhanced Contact & CTA Section --- */}
      <FadeInSection className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center border-t border-black/20 dark:border-white/20 pt-12 sm:pt-16 pb-16 sm:pb-20 md:pb-24 lg:pb-32 relative z-10" delay={0.4}>
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-4 sm:mb-6"
          style={{
            textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          READY TO UNLOCK THE POTENTIAL OF YOUR LAND?
        </motion.h2>
        
        <motion.p 
          className="text-base sm:text-lg text-black/70 dark:text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto font-mono"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Get started today with a free consultation or join our platform to tokenize your property.
        </motion.p>
        
        <motion.div 
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 0, 0, 0.4)" }} 
          whileTap={{ scale: 0.95 }} 
          className="inline-block mb-6 sm:mb-8"
        >
          <AnimatedButton className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white hover:bg-black/90 dark:hover:bg-white/90 px-6 sm:px-8 py-3 font-mono uppercase tracking-wider rounded-cyber shadow-[0_0_20px_rgba(0,0,0,0.3)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            REQUEST CONSULTATION
          </AnimatedButton>
        </motion.div>
        
        <motion.p 
          className="text-sm text-black/60 dark:text-white/60 font-mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Contact us at <a href="mailto:info@tokenland.com" className="hover:underline text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors">info@tokenland.com</a> or call <a href="tel:+18001234567" className="hover:underline text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 transition-colors">+1-800-123-4567</a>.
        </motion.p>
      </FadeInSection>
    </div>
  );
};

export default HomePage;
