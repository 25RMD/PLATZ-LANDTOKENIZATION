import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "purple" | "pink" | "gradient";
  className?: string;
}

const sizeClasses = {
  xs: "h-4 w-4 border-2",
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-10 w-10 border-3",
  xl: "h-12 w-12 border-3",
};

const colorClasses = {
  primary: "border-gray-300 border-t-purple-500",
  white: "border-gray-300 border-t-white",
  purple: "border-gray-300 border-t-purple-600",
  pink: "border-gray-300 border-t-pink-500",
  gradient: "border-gray-300 border-t-transparent",
};

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}: LoadingSpinnerProps) => {
  const gradientSpinner = (
    <div
      className={`${sizeClasses[size]} rounded-full ${className}`}
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0%, #8B5CF6 50%, #EC4899 100%)",
      }}
    />
  );

  const regularSpinner = (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  return color == "gradient" ? gradientSpinner : regularSpinner;
};

export default LoadingSpinner;
