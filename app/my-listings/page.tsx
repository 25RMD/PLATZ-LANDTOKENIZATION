"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiEdit, FiCpu } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import { useAccount } from 'wagmi';
import MintNFTModal, { MintNFTData } from '@/components/nft/MintNFTModal';
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
  const [loading, setLoading] = useState(true); // This now only tracks data fetching
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
    if (authLoading) {
      return; // Wait for authentication to resolve
    }
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchListings = async () => {
        setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (userId) {
          headers['x-user-id'] = userId;
        }
          const response = await fetch('/api/my-listings', { headers });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error fetching listings');
          }
          const data = await response.json();
          if (data.success) {
            setListings(data.listings || []);
          } else {
            throw new Error(data.message || 'Failed to fetch listings');
        }
      } catch (err) {
        setError('Failed to load your listings. Please try again later.');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isAuthenticated, authLoading, router, userId]);

  // Handler to open the mint modal
  const handleOpenMintModal = (listing: LandListing) => {
    if (!isConnected || !walletAddress) {
      setMintingStatus('Error: Please connect your Ethereum wallet first');
      return;
    }
    setSelectedListing(listing);
    setShowMintModal(true);
  };

  // Function to mint NFT for a listing
  const mintNft = async (mintData: MintNFTData) => {
      setIsSubmitting(true);
      const listingId = mintData.landListingId;
      setMintingListingId(listingId);
      setMintingStatus('Initiating minting process...');
    try {
      const imageBase64 = await fileToBase64(mintData.imageFile);
      const jsonData = {
        landListingId: listingId,
        nftTitle: mintData.nftTitle,
        nftDescription: mintData.nftDescription,
        imageBase64,
        ownerAddress: walletAddress,
        quantity: 99
      };
      const response = await fetch('/api/nft/mint-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {})
        },
        body: JSON.stringify(jsonData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mint NFT');
      }
      setMintingStatus(`NFT "${mintData.nftTitle}" minted successfully!`);
      setShowMintModal(false);
      setSelectedListing(null);
      // Refresh listings after a short delay
      setTimeout(() => {
        const fetchUpdatedListings = async () => {
          try {
            const res = await fetch('/api/my-listings', { headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) } });
            const updatedData = await res.json();
            if (updatedData.success) setListings(updatedData.listings || []);
          } catch (e) { console.error('Error refreshing listings:', e); }
        };
        fetchUpdatedListings();
      }, 3000);
    } catch (err: any) {
      setMintingStatus(`Error: ${err.message || 'Failed to mint NFT'}`);
      throw err; // Propagate error to modal
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
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
        return 'bg-gray-400/20 text-gray-400 border border-gray-400/30';
    }
  };

  // This is the correct loading state management.
  // Show a loader while authentication is in progress.
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulsingDotsSpinner />
      </div>
    );
  }

  // After auth check, if not authenticated, the effect above will redirect.
  // We can return null to avoid flashing any content.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-light dark:bg-primary-dark">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">My Listings</h1>
          <AnimatedButton href="/my-listings/create">
            Create New Listing
          </AnimatedButton>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <PulsingDotsSpinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p>{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-500 bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-10">
            <h2 className="text-xl font-medium text-text-light dark:text-text-dark">No listings found.</h2>
            <p className="mt-2">Get started by creating a new land listing.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900/50 shadow-lg rounded-lg overflow-hidden border border-text-light/10 dark:border-text-dark/10">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-800">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <Link href={`/my-listings/${listing.id}`} className="block hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-cyber-ink dark:text-cyber-bright truncate">{listing.nftTitle || `Listing #${listing.id}`}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                            {listing.status}
                        </p>
                      </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            Parcel: {listing.parcelNumber || 'N/A'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                            Created: {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
          </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMintStatusColor(listing.mintStatus)}`}>
                            {listing.mintStatus || 'NOT MINTED'}
                          </p>
                        </div>
                      </div>
                       <div className="mt-4 flex justify-end space-x-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/my-listings/${listing.id}/edit`);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center text-sm"
                        >
                          <FiEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenMintModal(listing);
                          }}
                          disabled={listing.mintStatus === 'MINTED' || listing.mintStatus === 'PENDING' || !isConnected}
                          className="px-3 py-1 bg-cyber-accent hover:bg-cyber-accent/80 text-black rounded-md flex items-center text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <FiCpu className="mr-1" /> Mint
                        </button>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
      )}
      </main>

      {showMintModal && selectedListing && (
        <MintNFTModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
        onSubmit={mintNft}
          listing={selectedListing}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
