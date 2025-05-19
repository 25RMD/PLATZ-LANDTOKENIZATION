"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FiEdit, FiEye, FiCpu } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';
import { useAccount } from 'wagmi';
import MintNFTModal, { MintNFTData } from '@/components/nft/MintNFTModal';

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
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SOLD': return 'bg-blue-100 text-blue-800';
      case 'DELISTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get mint status badge color
  const getMintStatusColor = (status: string | null) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Land Listings</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-4">You don't have any land listings yet</h2>
          <p className="mb-6">Create your first land listing to get started</p>
          <Link href="/create">
            <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
              Create Land Listing
            </AnimatedButton>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <span className="text-gray-600">Total Listings: {listings.length}</span>
            </div>
            <Link href="/create">
              <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                Create New Listing
              </AnimatedButton>
            </Link>
          </div>
          
          {mintingStatus && (
            <div className={`mb-4 p-4 rounded ${mintingStatus.includes('Error') ? 'bg-red-100 text-red-700' : mintingStatus.includes('success') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {mintingStatus}
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mint Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  {process.env.NODE_ENV === 'development' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {listing.nftTitle || 'Untitled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{listing.parcelNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                        {listing.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMintStatusColor(listing.mintStatus)}`}>
                        {listing.mintStatus || 'NOT_STARTED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {listing.listingPrice ? `${listing.listingPrice} ${listing.priceCurrency || 'ETH'}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    {process.env.NODE_ENV === 'development' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {listing.userId ? listing.userId.substring(0, 8) + '...' : 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="text-indigo-600 hover:text-indigo-900">
                          <FiEye className="h-5 w-5" title="View" />
                        </Link>
                        
                        {listing.status === 'DRAFT' && (
                          <Link
                            href={`/create?edit=${listing.id}`}
                            className="text-blue-600 hover:text-blue-900">
                            <FiEdit className="h-5 w-5" title="Edit" />
                          </Link>
                        )}
                        
                        {(listing.mintStatus === 'NOT_STARTED' || listing.mintStatus === 'FAILED') && (
                          <button
                            onClick={() => handleOpenMintModal(listing)}
                            disabled={isSubmitting || mintingListingId === listing.id}
                            className={`text-green-600 hover:text-green-900 ${(isSubmitting || mintingListingId === listing.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <FiCpu className="h-5 w-5" title="Mint NFT" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* NFT Minting Modal */}
      {selectedListing && (
        <MintNFTModal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false);
            setSelectedListing(null);
          }}
          onMint={mintNft}
          listingId={selectedListing.id}
          listingTitle={selectedListing.nftTitle || ''}
          listingDescription={selectedListing.propertyDescription}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
