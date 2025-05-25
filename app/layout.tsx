import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "@/app/globals.css";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { ThemeProvider } from 'next-themes'; 
import { WagmiProvider } from '@/components/providers/WagmiProvider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Inter } from "next/font/google";
import ErrorBoundary from '@/app/error-boundary';

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "Discover, collect, and sell extraordinary NFTs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${GeistSans.variable} ${GeistMono.variable} font-mono bg-secondary-light dark:bg-primary-dark text-text-light dark:text-text-dark transition-colors duration-300`}
      >        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WagmiProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  className: '',
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10B981',
                      color: 'white',
                    }
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                      color: 'white',
                    },
                  }
                }}
              />
            </AuthProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
