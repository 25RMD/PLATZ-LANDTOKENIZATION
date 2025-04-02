import { AnimatedButtonProps } from "@/lib/interdace";
import { Variants } from "framer-motion";
import React from "react";
import { motion } from "framer-motion";

const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case "sm":
      return "px-3 py-1.5 text-sm";
    case "lg":
      return "px-6 py-3 text-lg";
    default: // md
      return "px-4 py-2 text-base";
  }
};

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case "secondary":
      return "bg-gray-700 text-white hover:bg-gray-600";
    case "outline":
      return "bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:bg-opacity-10";
    case "gradient":
      return "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700";
    default: // primary
      return "bg-purple-600 text-white hover:bg-purple-700";
  }
};

const AnimatedButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  isConnect = false,
}: AnimatedButtonProps) => {
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const widthClass = fullWidth ? "w-full" : "w-auto";
  return (
    <motion.button
      type={type}
      onClick={() => onClick?.(isConnect)}
      disabled={disabled}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? {} : "hover"}
      whileTap={disabled ? {} : "tap"}
      animate={disabled ? "disabled" : "rest"}
      className={`${variantClasses} ${sizeClasses} ${widthClass} rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
