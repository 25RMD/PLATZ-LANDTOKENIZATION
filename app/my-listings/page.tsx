"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiEdit, FiEye, FiCpu } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import { useAccount } from 'wagmi';
import MintNFTModal, { MintNFTData } from '@/components/nft/MintNFTModal';
import { motion } from 'framer-motion';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

// Define the LandListing type based on your Prisma schema
interface LandListing {
  id: string;
  nftTitle: string | null;
  parcelNumber: string | null;
  status: string | null;
  mintStatus: string | null;
  listingPrice: number | null;
  priceCurrency: string | null;
  createdAt: string;
  updatedAt: string;
  userId?: string; // Optional userId field for debugging
  propertyDescription?: string; // Added for NFT description
}

export default function MyListingsPage() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintingListingId, setMintingListingId] = useState<string | null>(null);
  const [mintingStatus, setMintingStatus] = useState<string | null>(null);
  
  // Modal state
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<LandListing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Add wallet connection
  const { address: walletAddress, isConnected } = useAccount();

  // Fetch user's listings
  useEffect(() => {
    // Don't redirect immediately, wait for auth check to complete
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('My Listings: User authenticated, userId:', userId);

    const fetchListings = async () => {
      try {
        setLoading(true);
        console.log('My Listings: Fetching listings from API...');
        
        // Add user ID to headers for development purposes
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (userId) {
          headers['x-user-id'] = userId;
        }
        
        try {
          const response = await fetch('/api/my-listings', { headers });
          console.log('My Listings: API response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error response:', errorData);
            throw new Error(errorData.message || `Error fetching listings: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('My Listings: Received data:', data);
          
          if (data.success) {
            setListings(data.listings || []);
            console.log('My Listings: Set listings, count:', data.listings?.length || 0);
          } else {
            throw new Error(data.message || 'Failed to fetch listings');
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load your listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isAuthenticated, router, userId, authLoading]);

  // Handler to open the mint modal
  const handleOpenMintModal = (listing: LandListing) => {
    // Check if wallet is connected
    if (!isConnected || !walletAddress) {
      setMintingStatus('Error: Please connect your Ethereum wallet first');
      return;
    }
    
    setSelectedListing(listing);
    setShowMintModal(true);
  };

  // Function to mint NFT for a listing
  const mintNft = async (mintData: MintNFTData) => {
    try {
      setIsSubmitting(true);
      const listingId = mintData.landListingId;
      setMintingListingId(listingId);
      setMintingStatus('Initiating minting process...');
      
      // Convert image file to base64
      const imageBase64 = await fileToBase64(mintData.imageFile);
      
      // Prepare JSON data for collection minting with fixed quantity
      const jsonData = {
        landListingId: listingId,
        nftTitle: mintData.nftTitle,
        nftDescription: mintData.nftDescription,
        imageBase64,
        ownerAddress: walletAddress, // Ensure this is the intended recipient
        quantity: 99 // Fixed quantity of 99 child tokens (1 main + 99 children = 100 total)
      };
      
      // Use the /api/nft/mint-collection API endpoint for collections
      const response = await fetch('/api/nft/mint-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {})
        },
        body: JSON.stringify(jsonData),
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('Minting error response:', data);
        throw new Error(data.message || `Failed to mint NFT: ${response.status}`);
      }
      
      console.log('Minting successful:', data);
      setMintingStatus(`NFT "${mintData.nftTitle}" minted successfully!`);
      
      // Close the modal
      setShowMintModal(false);
      setSelectedListing(null);
      
      // Refresh the listings to show updated status
      setTimeout(() => {
        // Fetch updated listings instead of full page reload
        const fetchUpdatedListings = async () => {
          try {
            const headers: HeadersInit = {
              'Content-Type': 'application/json'
            };
            if (userId) headers['x-user-id'] = userId;
            
            const response = await fetch('/api/my-listings', { headers });
            if (!response.ok) throw new Error('Failed to refresh listings');
            
            const data = await response.json();
            if (data.success) {
              setListings(data.listings || []);
              console.log('Listings refreshed after minting');
            }
          } catch (refreshError) {
            console.error('Error refreshing listings:', refreshError);
          }
        };
        
        fetchUpdatedListings();
      }, 3000);
      
    } catch (err: any) {
      console.error('Error minting NFT:', err);
      setMintingStatus(`Error: ${err.message || 'Failed to mint NFT'}`);
      
      // Don't close the modal on error, let user retry
      setIsSubmitting(false);
      
      // Propagate error to modal
      throw err;
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        if (mintingStatus && mintingStatus.includes('success')) {
          setMintingStatus(null);
          setMintingListingId(null);
        }
      }, 10000);
    }
  };

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Function to get status badge color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-minimal/20 text-success-minimal border border-success-minimal/30';
      case 'DRAFT':
        return 'bg-warning-minimal/20 text-warning-minimal border border-warning-minimal/30';
      case 'INACTIVE':
        return 'bg-error-minimal/20 text-error-minimal border border-error-minimal/30';
      default:
        return 'bg-black/10 dark:bg-white/10 text-text-light dark:text-text-dark border border-black/10 dark:border-white/10';
    }
  };

  // Function to get mint status badge color
  const getMintStatusColor = (status: string | null) => {
    switch (status) {
      case 'MINTED':
        return 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/30';
      case 'PENDING':
        return 'bg-warning-minimal/20 text-warning-minimal border border-warning-minimal/30';
      case 'FAILED':
        return 'bg-error-minimal/20 text-error-minimal border border-error-minimal/30';
      default:
        return 'bg-black/10 dark:bg-white/10 text-text-light dark:text-text-dark border border-black/10 dark:border-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-primary-light dark:bg-primary-dark">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header with cyber styling */}
        <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-6 mb-8 cyber-grid backdrop-blur-cyber">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark mb-4 font-mono bg-gradient-to-r from-text-light via-cyber-accent to-text-light dark:from-text-dark dark:via-cyber-glow dark:to-text-dark bg-clip-text text-transparent">
            My Listings
          </h1>
          <p className="text-text-light dark:text-text-dark opacity-70 font-mono text-lg">
            Manage your land tokenization listings and mint NFT collections
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-warning-minimal/10 border border-warning-minimal/30 rounded-cyber-lg p-4 mb-6 cyber-grid">
            <div className="flex items-center gap-3">
              <FiCpu className="w-5 h-5 text-warning-minimal" />
              <div>
                <p className="text-warning-minimal font-semibold font-mono">Wallet Not Connected</p>
                <p className="text-text-light dark:text-text-dark opacity-70 text-sm font-mono">
                  Connect your wallet to mint NFTs from your listings
                </p>
              </div>
            </div>
        </div>
        )}

        {/* Minting Status */}
        {mintingStatus && (
          <div className={`border rounded-cyber-lg p-4 mb-6 cyber-grid backdrop-blur-cyber ${
            mintingStatus.includes('Error') ? 
              'bg-error-minimal/10 border-error-minimal/30 text-error-minimal' : 
              'bg-success-minimal/10 border-success-minimal/30 text-success-minimal'
          }`}>
            <p className="font-mono font-semibold">{mintingStatus}</p>
        </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-8 cyber-grid">
              <PulsingDotsSpinner className="text-cyber-accent" />
              <p className="text-text-light dark:text-text-dark mt-4 font-mono">Loading your listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-error-minimal/10 border border-error-minimal/30 rounded-cyber-lg p-6 text-center cyber-grid">
            <p className="text-error-minimal font-mono text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-error-minimal/10 border border-error-minimal/30 rounded-cyber text-error-minimal hover:bg-error-minimal/20 transition-all duration-300 font-mono"
            >
              Retry
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-8 text-center cyber-grid backdrop-blur-cyber">
            <FiEdit className="w-16 h-16 text-text-light dark:text-text-dark opacity-30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2 font-mono">No Listings Found</h3>
            <p className="text-text-light dark:text-text-dark opacity-70 mb-6 font-mono">
              You haven't created any land listings yet. Create your first listing to get started.
            </p>
            <Link href="/create">
              <AnimatedButton className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white px-6 py-3 font-mono">
                Create New Listing
              </AnimatedButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-secondary-light dark:bg-secondary-dark border border-black/10 dark:border-white/10 rounded-cyber-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group cyber-grid backdrop-blur-cyber"
                >
                  {/* Cyber scan line effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-cyber-lg overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-glow/10 to-transparent w-full h-full animate-cyber-scan" />
                  </div>

                  <div className="relative z-10 p-6">
                    {/* Header with Status Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1 font-mono">
                          {listing.nftTitle || 'Untitled Listing'}
                        </h3>
                        <p className="text-sm text-text-light dark:text-text-dark opacity-60 font-mono">
                          ID: {listing.id.slice(0, 8)}...
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <span className={`text-xs px-2 py-1 rounded-cyber font-mono ${getStatusColor(listing.status)}`}>
                          {listing.status || 'DRAFT'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-cyber font-mono ${getMintStatusColor(listing.mintStatus)}`}>
                          {listing.mintStatus || 'NOT_MINTED'}
                        </span>
                      </div>
          </div>
          
                    {/* Listing Details */}
                    <div className="space-y-3 mb-6">
                      {listing.parcelNumber && (
                        <div className="flex justify-between text-sm font-mono">
                          <span className="text-text-light dark:text-text-dark opacity-60">Parcel #</span>
                          <span className="text-text-light dark:text-text-dark">{listing.parcelNumber}</span>
            </div>
          )}
          
                      {listing.listingPrice && (
                        <div className="flex justify-between text-sm font-mono">
                          <span className="text-text-light dark:text-text-dark opacity-60">Price</span>
                          <span className="text-cyber-accent font-bold">
                            {listing.listingPrice} {listing.priceCurrency || 'ETH'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-text-light dark:text-text-dark opacity-60">Created</span>
                        <span className="text-text-light dark:text-text-dark">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-text-light dark:text-text-dark opacity-60">Updated</span>
                        <span className="text-text-light dark:text-text-dark">
                          {new Date(listing.updatedAt).toLocaleDateString()}
                      </span>
                      </div>
                    </div>

                    {/* Property Description */}
                    {listing.propertyDescription && (
                      <div className="mb-6">
                        <p className="text-sm text-text-light dark:text-text-dark opacity-70 line-clamp-3 font-mono">
                          {listing.propertyDescription}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/create?edit=${listing.id}`}
                          className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono text-sm group"
                        >
                          <FiEdit className="inline w-4 h-4 mr-1 group-hover:text-cyber-accent transition-colors duration-300" />
                          Edit
                        </Link>
                        
                          <Link
                          href={`/listings/${listing.id}`}
                          className="flex-1 px-3 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-cyber text-center text-text-light dark:text-text-dark hover:bg-black/10 dark:hover:bg-white/10 hover:border-cyber-accent/30 transition-all duration-300 font-mono text-sm group"
                        >
                          <FiEye className="inline w-4 h-4 mr-1 group-hover:text-cyber-accent transition-colors duration-300" />
                          View
                          </Link>
                      </div>
                        
                      {/* Mint NFT Button */}
                      {listing.status === 'ACTIVE' && listing.mintStatus !== 'MINTED' && (
                          <button
                            onClick={() => handleOpenMintModal(listing)}
                          disabled={mintingListingId === listing.id || !isConnected}
                          className="w-full px-4 py-2 bg-cyber-accent/10 border border-cyber-accent/30 rounded-cyber text-cyber-accent hover:bg-cyber-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono font-semibold group"
                          >
                          <FiCpu className="inline w-4 h-4 mr-2 group-hover:animate-spin transition-transform duration-300" />
                          {mintingListingId === listing.id ? 'Minting...' : 'Mint NFT Collection'}
                          </button>
                        )}

                      {listing.mintStatus === 'MINTED' && (
                        <div className="w-full px-4 py-2 bg-success-minimal/10 border border-success-minimal/30 rounded-cyber text-success-minimal text-center font-mono font-semibold">
                          ✓ NFT Collection Minted
                        </div>
                      )}
                    </div>
                      </div>
                </motion.div>
              ))}
            </div>

            {/* Add New Listing Button */}
            <div className="bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg border border-black/10 dark:border-white/10 p-6 text-center cyber-grid backdrop-blur-cyber">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2 font-mono">Ready to tokenize more land?</h3>
              <p className="text-text-light dark:text-text-dark opacity-70 mb-4 font-mono">
                Create additional listings to expand your tokenized real estate portfolio
              </p>
              <Link href="/create">
                <AnimatedButton className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-white hover:text-black hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white px-6 py-3 font-mono">
                  Create New Listing
                </AnimatedButton>
              </Link>
            </div>
          </div>
      )}
      </div>

      {/* Mint NFT Modal */}
        <MintNFTModal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false);
            setSelectedListing(null);
          }}
        onSubmit={mintNft}
        landListing={selectedListing}
          isSubmitting={isSubmitting}
        />
    </div>
  );
}
