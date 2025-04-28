"use client";
import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import AnimatedButton from "@/components/common/AnimatedButton";
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

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Card flip transition
const flipTransition = {
  duration: 0.6,
  ease: "easeInOut",
};

const HomePage = () => {
  // --- Tilt Effect Logic --- 
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Adjust sensitivity (lower value = more tilt)
  const rotateX = useTransform(y, [-100, 100], [5, -5]); 
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate mouse position relative to the element center (from -100 to 100)
    const elementX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2) * 100; 
    const elementY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2) * 100;
    x.set(elementX);
    y.set(elementY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  // --- End Tilt Effect Logic --- 

  return (
    <div className="space-y-24 md:space-y-32 pb-16"> {/* Add spacing between sections */}
      {/* --- Slide 1: Hero --- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible" // Animate hero immediately
        className="text-center min-h-screen flex flex-col justify-center" // Apply full height and vertical centering
        onMouseMove={handleMouseMove} // Track mouse move on the section
        onMouseLeave={handleMouseLeave} // Reset on leave
        style={{ perspective: 800 }} // Add perspective to the parent for 3D effect
      >
        {/* Apply complex text styling: clamp size/leading, tracking, gradient */}
        <motion.h1 
          className="
            text-[clamp(2.625rem,_0.7086rem_+_8.1768vw,_7.25rem)] 
            font-bold 
            leading-[clamp(2.938rem,_0.8144rem_+_9.0608vw,_8.063rem)] 
            tracking-[-0.04em] /* Approximated -tracking-4 */ 
            bg-gradient-to-b from-black via-black to-neutral-600 /* Light mode gradient */ 
            dark:from-white dark:via-white dark:to-neutral-400 /* Dark mode gradient */ 
            bg-clip-text text-transparent 
            mb-6 max-w-4xl mx-auto
          "
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} // Apply dynamic rotation
        >
          Tokenize Your Land, Unlock Global Opportunity
        </motion.h1>
        <p className="text-lg md:text-xl text-text-light dark:text-text-dark opacity-70 mb-8 max-w-2xl mx-auto">
          Transform your property into digital tokens. Enable fractional ownership and global liquidity for your assets.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/collections" legacyBehavior>
            <a>
              {/* Added hover/tap scale effect */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AnimatedButton className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white">
                  Get Started
                </AnimatedButton>
              </motion.div>
            </a>
          </Link>
          {/* Optional secondary button */}
          {/* <AnimatedButton 
            variant="outline" 
            className="border-black text-black dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Learn More
          </AnimatedButton> */}
        </div>
      </motion.section>

      {/* --- Slide 2: Features --- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="container mx-auto px-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-12 text-center">
          Features
        </h2>
        {/* Added perspective for 3D effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 [perspective:1000px]">
          {[ // Feature data
            { icon: FiPieChart, title: "Fractional Ownership", description: "Each token represents a fractional share of your property, lowering the entry barrier for investors." },
            { icon: FiRepeat, title: "Enhanced Liquidity", description: "Trade tokens 24/7 on blockchain-based marketplaces for near-instant transactions." },
            { icon: FiCheckSquare, title: "Automated Compliance", description: "Built-in smart contracts automate KYC/AML and regulatory compliance." },
            { icon: FiGlobe, title: "Global Market Access", description: "Open your land to a global pool of investors, unrestricted by geography." },
            { icon: FiLock, title: "Secure Title Management", description: "Immutable blockchain records ensure tamper-proof property rights and transparent histories." },
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="relative [transform-style:preserve-3d]" 
              whileHover={{ rotateY: 180 }}
              transition={flipTransition}
            >
              {/* Card Front */}
              <div className="relative z-10 p-6 border border-black/10 dark:border-white/10 rounded-lg h-full bg-primary-light dark:bg-card-dark [backface-visibility:hidden]">
                <feature.icon className="text-3xl text-text-light dark:text-text-dark mb-4 mx-auto md:mx-0" />
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-light dark:text-text-dark opacity-70">
                  {feature.description}
                </p>
              </div>
              {/* Card Back */}
              <div className="absolute inset-0 p-6 border border-black/10 dark:border-white/10 rounded-lg h-full bg-primary-light dark:bg-card-dark [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center items-center">
                 {/* Example back content */}
                 <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2 text-center">
                  {feature.title}
                 </h3>
                 <p className="text-sm text-text-light dark:text-text-dark opacity-70 text-center">
                   Learn More (Placeholder)
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* --- Slide 3: How It Works --- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="container mx-auto px-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-12 text-center">
          How It Works
        </h2>
        {/* Added perspective for 3D effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 [perspective:1000px]">
          {[ // Steps data
            { icon: FiUserCheck, title: "1. Verify & Onboard", description: "Upload your title deeds and complete our secure KYC process to verify property ownership." },
            { icon: FiCpu, title: "2. Tokenize Asset", description: "Smart contracts mint digital tokens representing your land's equity, ready for distribution." },
            { icon: FiBarChart2, title: "3. Trade & Manage", description: "List tokens on integrated exchanges, track ownership, and receive dividends automatically." },
          ].map((step, index) => (
            <motion.div 
              key={index} 
              className="relative [transform-style:preserve-3d]" 
              whileHover={{ rotateY: 180 }}
              transition={flipTransition}
            >
              {/* Card Front */}
              <div className="relative z-10 p-6 border border-black/10 dark:border-white/10 rounded-lg h-full bg-primary-light dark:bg-card-dark [backface-visibility:hidden]">
                <step.icon className="text-4xl text-text-light dark:text-text-dark mb-5 mx-auto" />
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-text-light dark:text-text-dark opacity-70 text-center">
                  {step.description}
                </p>
              </div>
              {/* Card Back */}
              <div className="absolute inset-0 p-6 border border-black/10 dark:border-white/10 rounded-lg h-full bg-primary-light dark:bg-card-dark [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center items-center">
                 <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2 text-center">
                  {step.title}
                 </h3>
                 <p className="text-sm text-text-light dark:text-text-dark opacity-70 text-center">
                   Details (Placeholder)
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* --- Slide 4: About Us --- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="container mx-auto px-4 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-8">
          About Us
        </h2>
        <div className="max-w-3xl mx-auto space-y-4 text-lg text-text-light dark:text-text-dark opacity-80">
          <p>
            At Platz, our mission is to democratize real estate ownership by leveraging blockchain technology.
          </p>
          <p>
            Founded by experts in property law and decentralized finance, we bridge traditional land registries with innovative digital solutions.
          </p>
          <p>
            We are committed to transparency, security, and regulatory compliance in every step.
          </p>
        </div>
      </motion.section>

      {/* --- Slide 5: Contact & CTA --- */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="container mx-auto px-4 text-center border-t border-black/10 dark:border-white/10 pt-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mb-6">
          Ready to unlock the potential of your land?
        </h2>
        <p className="text-lg text-text-light dark:text-text-dark opacity-70 mb-8 max-w-2xl mx-auto">
          Get started today with a free consultation or join our platform to tokenize your property.
        </p>
        {/* Added hover/tap scale effect */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mb-8">
          <AnimatedButton className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white">
            Request Consultation
          </AnimatedButton>
        </motion.div>
        <p className="text-sm text-text-light dark:text-text-dark opacity-60">
          Contact us at <a href="mailto:info@tokenland.com" className="hover:underline">info@tokenland.com</a> or call <a href="tel:+18001234567" className="hover:underline">+1-800-123-4567</a>.
        </p>
      </motion.section>
    </div>
  );
};

export default HomePage;
