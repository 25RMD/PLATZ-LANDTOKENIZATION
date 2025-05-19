"use client";
import React from "react";
import Link from "next/link";
import { FiMail, FiPhone, FiTwitter, FiLinkedin, FiSend } from 'react-icons/fi';
import { IoMapOutline } from "react-icons/io5";

// Define interfaces for link structures
interface FooterLink {
  name: string;
  url: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Structure links based on provided text
  const quickLinks: FooterLink[] = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/#features" }, // Assuming features are on the homepage
    { name: "How It Works", url: "/#how-it-works" }, // Assuming section exists
    { name: "About Us", url: "/#about" }, // Assuming section exists
    { name: "Contact", url: "/#contact" }, // Assuming section exists
  ];

  const resources: FooterLink[] = [
    { name: "Whitepaper", url: "/whitepaper.pdf" }, // Placeholder path
    { name: "FAQ", url: "/faq" }, // Placeholder path
    { name: "Blog", url: "/blog" }, // Placeholder path
  ];

  const legalLinks: FooterLink[] = [
    { name: "Privacy Policy", url: "/privacy-policy" }, // Placeholder path
    { name: "Terms of Service", url: "/terms-of-service" }, // Placeholder path
    { name: "Disclaimer", url: "/disclaimer" }, // Placeholder path
  ];

  const socialLinks = [
    { name: "Twitter", icon: FiTwitter, url: "https://twitter.com/platz" }, // Placeholder URL
    { name: "LinkedIn", icon: FiLinkedin, url: "https://linkedin.com/company/platz" }, // Placeholder URL
    { name: "Telegram", icon: FiSend, url: "https://t.me/platz" }, // Placeholder URL
  ];

  return (
    <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Column 1: Company Info */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 group mb-1">
              <IoMapOutline className="text-text-light dark:text-text-dark text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-xl font-bold text-text-light dark:text-text-dark group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Platz
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              Platz is a leading land tokenization platform democratizing property investment through blockchain technology.
            </p>
             <p className="text-sm text-gray-500 dark:text-gray-500">
              123 Blockchain Avenue, Suite 100, New York, NY 10001
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-4 tracking-wide uppercase">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-4 tracking-wide uppercase">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-4 tracking-wide uppercase">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info could be here or below */}
        </div>

        {/* Bottom Section: Contact, Social, Copyright, Disclaimer */}
        <div className="border-t border-gray-200 dark:border-zinc-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <a href="mailto:info@platz.com" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <FiMail className="w-4 h-4" /> info@platz.com
              </a>
              <a href="tel:+18001234567" className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <FiPhone className="w-4 h-4" /> +1-800-123-4567
              </a>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 space-y-2">
            <p>© {currentYear} Platz. All rights reserved.</p>
            <p>
              Digital tokens issued by Platz are securities and may only be offered or sold in jurisdictions where such offerings are permitted.
              Consult your legal advisor for details on eligibility and regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
