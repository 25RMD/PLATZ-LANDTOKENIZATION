"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// A lightweight card component set inspired by shadcn/ui
// Provides simple building blocks (Card, CardHeader, CardContent, etc.)
// that rely purely on Tailwind classes so they work without extra deps.
// Feel free to refine styling later to better match the project's cyber theme.

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( (
  { className, ...props }, ref ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-cyber border border-black/10 dark:border-white/10 bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark shadow-lg",
        className
      )}
      {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( (
  { className, ...props }, ref ) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-b border-black/10 dark:border-white/10", className)}
      {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>( (
  { className, ...props }, ref ) => (
    <h3
      ref={ref as any}
      className={cn("text-lg font-bold leading-none tracking-tight font-mono", className)}
      {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>( (
  { className, ...props }, ref ) => (
    <p ref={ref} className={cn("text-sm text-text-light/70 dark:text-text-dark/70", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( (
  { className, ...props }, ref ) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>( (
  { className, ...props }, ref ) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-t border-black/10 dark:border-white/10", className)}
      {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
