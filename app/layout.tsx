import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "@/app/globals.css";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { ThemeProvider } from 'next-themes'; 
import { WagmiProvider } from '@/components/providers/WagmiProvider';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
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
              <CurrencyProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow pt-20 sm:pt-24">
                    <div className="min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)]">
                      {children}
                    </div>
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
              </CurrencyProvider>
            </AuthProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
