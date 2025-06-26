import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "@/app/globals.css";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { ThemeProvider } from 'next-themes'; 
import { WagmiProvider } from '@/components/providers/WagmiProvider'; // Re-enabled with SSR support
import { AuthProvider } from '@/context/AuthContext'; // Re-enabled with hydration guards
import { CurrencyProvider } from '@/context/CurrencyContext'; // Re-enabled with hydration guards
import { ExploreStateProvider } from '@/context/ExploreStateContext';
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
        className={`${GeistSans.variable} ${GeistMono.variable} font-mono bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark transition-all duration-500 cyber-grid`}
        suppressHydrationWarning={true}
      >        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WagmiProvider>
            <AuthProvider>
              <CurrencyProvider>
                <ExploreStateProvider>
                  <div className="flex flex-col min-h-screen relative overflow-hidden">
                  <Header />
                    <main className="flex-grow pt-20 sm:pt-24 relative z-10">
                    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)]">
                      {children}
                    </div>
                  </main>
                  <Footer />
                    
                    {/* Cyber ambient effects */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-glow/30 to-transparent animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-glow/30 to-transparent animate-pulse"></div>
                    </div>
                </div>
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    className: '',
                    duration: 5000,
                    style: {
                        background: 'rgba(0, 0, 0, 0.9)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-geist-mono)',
                        fontSize: '14px',
                        backdropFilter: 'blur(12px)',
                    },
                    success: {
                      duration: 3000,
                      style: {
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#22C55E',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                      }
                    },
                    error: {
                      style: {
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        },
                      },
                      loading: {
                        style: {
                          background: 'rgba(0, 255, 255, 0.1)',
                          color: '#00FFFF',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                      },
                    }
                  }}
                />
                </ExploreStateProvider>
              </CurrencyProvider>
            </AuthProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
