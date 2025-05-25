"use client";

import React, { useState, useEffect, useRef } from 'react';
import useWatchlist from '@/hooks/useWatchlist';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getImageUrl, getPlaceholderImage } from '@/lib/utils/imageUtils';
import { FiAlertCircle, FiArrowLeft, FiStar, FiInfo, FiCopy, FiX, FiMoreHorizontal, FiCheckCircle, FiTwitter, FiMail, FiShare2, FiExternalLink, FiLoader } from 'react-icons/fi';
import Link from 'next/link';

import { LandListing as PrismaLandListing, User as PrismaUser } from '@prisma/client';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';
import NFTCard from '@/components/NFTCard'; // Added import for NFTCard

// Minimal interface for individual NFTs coming from the API
interface ProcessedNftFromAPI {
  id: string;
  name: string;
  image: string | null;
  price: number | null;
  // Add other fields if needed for mapping, e.g., owner info if NFTCard requires it directly
}

// Interface for the data structure NFTCard expects
interface NFTCardData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string; // Pre-formatted string including currency
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
}

// Updated interface to include full stats and correct derived counts
interface LandListingWithCollectionStats extends PrismaLandListing {
  nfts: ProcessedNftFromAPI[]; // Added field for individual NFTs
  user: PrismaUser | null;
  processedNftImageUrl: string | null;
  derivedCreatorName: string;
  derivedItemsCount: number;    // Calculated on backend
  derivedListedCount: number;   // Calculated on backend
  derivedOwnerCount: number;    // Calculated on backend
  stats: {
    topOffer: string | null;    // Prisma Decimal is serialized to string
    volume24h: string | null;   // Prisma Decimal is serialized to string
    sales24h: number | null;
  };
  // Explicitly define fields from PrismaLandListing that are directly used or might have type ambiguity
  listingPrice: number | null; // Corrected: Prisma's Float? is number | null
  priceCurrency: string | null; // Corrected: Prisma's String? is string | null
  createdAt: Date; // Prisma DateTime is Date
  nftDescription: string | null; // Corrected: Prisma's String? is string | null, not undefined

  // Add missing optional fields that are accessed in JSX
  mintAddress?: string | null;
  cadastralNumber?: string | null;
  permittedUse?: string | null;
  ownershipForm?: string | null;
  egrnRecordStatus?: string | null;
  isListedForSale?: boolean | null;
  metadataUri?: string | null;
  onChainOwnerPublicKey?: string | null;
  // Add other fields from PrismaLandListing if they are directly accessed and not covered
  // For example: titleDeedFileRef, legalDescription, parcelNumber, propertyAddress, etc.
  // If these are needed, they should be added here or ensured they are part of PrismaLandListing type correctly.
}

// ---- Helper functions moved here to address hoisting ----
const formatStat = (value: number | null | undefined, precision = 0): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
};

const formatCurrency = (value: number | null | undefined, currencySymbol?: string | null): string => {
    if (value === null || value === undefined) return 'N/A';
    const symbol = currencySymbol || ''; // Use provided currency symbol or empty string
    return symbol ? `${symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                   `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        // Ensure dateString is a Date object or a string that can be parsed into one
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
        console.warn('Invalid date string for formatDate:', dateString);
        return 'N/A';
    }
};

// Using the centralized getImageUrl utility function from lib/utils/imageUtils.ts
// Note: For banner images, we use a different default placeholder
const getBannerImageUrl = (imageRef: string | null | undefined): string => {
    return getImageUrl(imageRef, getPlaceholderImage('banner'));
};

// Helper for collection logo images (now NFT image)
const getLogoImageUrl = (imageRef: string | null | undefined): string => {
    return getImageUrl(imageRef, getPlaceholderImage('collection')); // 'collection' placeholder seems fine for NFT logo too
};
// ---- End of Helper functions ----

// Helper component for stats bar items
const StatItem = ({ title, value }: { title: string; value: string | number; }) => (
    <div className={`bg-primary-light dark:bg-card-dark p-4`}>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-xl font-semibold text-text-light dark:text-text-dark truncate" title={String(value)}>{value}</p>
    </div>
);

// Helper for Detail Items
const DetailItem = ({ label, value }: { label: string; value: string | number | null }) => {
    if (!value) return null;
    return (
        <div>
            <dt className="text-gray-500 dark:text-gray-400 font-medium">{label}</dt>
            <dd className="text-text-light dark:text-text-dark mt-0.5">{value}</dd>
        </div>
    );
};

// Helper for Copyable Text
const CopyableText = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); 
    };

    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="truncate max-w-[150px] sm:max-w-[200px]" title={text}>{text}</span>
            <button onClick={copyToClipboard} title="Copy to clipboard" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                {copied ? <FiCheckCircle className="w-3 h-3 text-green-500" /> : <FiCopy className="w-3 h-3" />}
            </button>
        </span>
    );
};

const SingleCollectionPage = () => {
    const params = useParams();
    const router = useRouter();
    const collectionId = params?.collectionId as string;

    const [collectionData, setCollectionData] = useState<LandListingWithCollectionStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false); // For 'About' section
    const [showMoreOptions, setShowMoreOptions] = useState(false); // For more options dropdown
    const [showToast, setShowToast] = useState(false); // For toast notifications
    const [toastMessage, setToastMessage] = useState(''); // Toast message content
    const [mappedNfts, setMappedNfts] = useState<NFTCardData[]>([]); // State for mapped NFTs for NFTCard
    
    // Use the watchlist hook instead of local state
    const { isWatchlisted, isWatchlistLoading, toggleWatchlist, checkWatchlistStatus } = useWatchlist(); 
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMoreOptions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // useEffect for fetching collection data
    useEffect(() => {
        if (!collectionId) {
            setError("Collection ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchCollectionData = async () => {
            if (!collectionId) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch(`/api/collections/${collectionId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: LandListingWithCollectionStats = await response.json();
                setCollectionData(data);
                
                // Check watchlist status using the hook function
                // Ensure checkWatchlistStatus is stable or correctly memoized if defined in this component
                await checkWatchlistStatus(collectionId);
                
            } catch (err: any) {
                console.error('Error fetching collection:', err);
                setError(err.message || 'Failed to load collection');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCollectionData();
    }, [collectionId, checkWatchlistStatus]); // checkWatchlistStatus should be stable if from useWatchlist hook

    // useEffect for mapping NFTs when collectionData changes
    useEffect(() => {
        if (collectionData && collectionData.nfts) {
            const newMappedNfts = collectionData.nfts.map((apiNft) => ({
                id: apiNft.id,
                name: apiNft.name || 'Unnamed NFT',
                description: collectionData.nftDescription || 'No description available.',
                image: getImageUrl(apiNft.image, getPlaceholderImage('collection')),
                price: formatCurrency(apiNft.price, collectionData.priceCurrency),
                creator: {
                    name: collectionData.derivedCreatorName || 'Unknown Creator',
                    avatar: getPlaceholderImage('collection'), 
                    verified: collectionData.user?.kycVerified || false,
                },
            }));
            setMappedNfts(newMappedNfts);
        } else {
            setMappedNfts([]); // Clear mapped NFTs if no collection data or no nfts
        }
        // getImageUrl, getPlaceholderImage, formatCurrency are now defined outside the component, so they are stable.
    // The dependency array for the mapping useEffect should reflect this.
    }, [collectionData]); // Removed getImageUrl, getPlaceholderImage, formatCurrency as they are stable

    if (isLoading) {
    if (isLoading && !collectionData) { // Show skeleton only if no data yet
        return (
            <div className="animate-pulse overflow-x-hidden">
                {/* Skeleton Header */}
                 <div className="bg-gray-300 dark:bg-zinc-700 relative w-full">
                    {/* Banner Skeleton */}
                    <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] w-full bg-gray-400 dark:bg-zinc-600"></div>
                    {/* Content Skeleton */}
                    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                        <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                            {/* Left Side Skeleton */}
                            <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                                {/* Logo Skeleton */}
                                <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square bg-gray-500 dark:bg-zinc-600"></div>
                                {/* Info Column Skeleton */}
                                <div className="flex flex-col w-full min-w-0">
                                    {/* Row 1: Title & Verified Badge */}
                                    <div className="flex items-center min-w-0 mb-2">
                                        <div className="h-8 bg-gray-400 dark:bg-zinc-500 rounded w-3/4"></div>
                                        <div className="w-6 h-6 bg-gray-400 dark:bg-zinc-500 rounded-full ml-2"></div>
                                    </div>
                                    {/* Row 2: Meta Tags Skeleton - Reduced one item as 'category' is removed */}
                                    <div className="flex w-full gap-2 flex-wrap md:flex-nowrap">
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-24"></div>
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-16"></div>
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-20"></div>
                                        {/* <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-20"></div> Category removed */}
                                    </div>
                                </div>
                            </div>
                            {/* Right Side Skeleton: Stats & Actions */}
                            <div className="flex min-w-0 flex-col items-end gap-4 pt-4 lg:pt-0">
                                {/* Action Buttons Skeleton */}
                                <div className="flex h-8 items-center justify-end gap-3">
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                </div>
                                {/* Stats Bar Skeleton */}
                                <div className="flex items-center overflow-hidden md:gap-8 w-full justify-between flex-wrap">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2">
                                            <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-16 mb-1"></div>
                                            <div className="h-5 bg-gray-400 dark:bg-zinc-500 rounded w-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Body */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 overflow-hidden">
                    <div className="mb-8">
                        <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-full mb-1"></div>
                        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                           <div key={i} className="bg-gray-300 dark:bg-zinc-600 p-4 rounded-lg"></div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error || !collectionData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 text-center">
                <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">
                    {error ? "Error Loading Property" : "Property Not Found"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || "The property you are looking for does not exist or could not be loaded."}
                </p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FiArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    // --- Main content rendering adjustments ---
    const bannerImage = getBannerImageUrl(collectionData.processedNftImageUrl); // Use processedNftImageUrl for banner
    const nftLogoImage = getLogoImageUrl(collectionData.processedNftImageUrl);  // Use processedNftImageUrl for logo

    const nftTitle = collectionData.nftTitle || "Untitled Property";
    const creatorName = collectionData.derivedCreatorName;
    // const itemsCount = collectionData.derivedItemsCount; // This is 1, may not need to display explicitly as "1 item"
    // const listedStatus = collectionData.derivedListedCount === 1 ? "Listed" : "Not Listed";
    // const ownerCountDisplay = collectionData.derivedOwnerCount; // This is 1

    // Parse decimal strings to numbers for formatting
    const price = collectionData.listingPrice ? parseFloat(String(collectionData.listingPrice)) : null;
    const topOffer = collectionData.stats?.topOffer ? parseFloat(collectionData.stats.topOffer) : null;
    const volume24h = collectionData.stats?.volume24h ? parseFloat(collectionData.stats.volume24h) : null;

    // Watchlist button specific to this NFT (using collectionData.id which is the LandListing ID)
    const WatchlistButton = () => (
        <button 
            onClick={(e) => { 
                e.stopPropagation(); // Prevent dropdown from closing if this button is inside it
                toggleWatchlist(collectionData.id);
            }}
            disabled={isWatchlistLoading} 
            className={`p-2 rounded-full transition-colors duration-150 
                        ${isWatchlisted ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                                       : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
            aria-label={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            {isWatchlistLoading ? <PulsingDotsSpinner size={20} color="bg-black dark:bg-white" /> : <FiStar className="w-5 h-5" />}
        </button>
    );

    const copyLinkToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const shareOnTwitter = () => {
        const text = `Check out this awesome property: ${nftTitle}`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };
    
    const shareViaEmail = () => {
        const subject = `Check out: ${nftTitle}`;
        const body = `I found this interesting property and wanted to share it with you: ${window.location.href}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-hidden"
        >
            {/* Banner Section */}
            <div className="bg-gradient-to-b from-gray-100 to-transparent dark:from-zinc-800 dark:to-transparent relative w-full">
                <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] w-full">
                    <img 
                        src={bannerImage}
                        alt={`${nftTitle} Banner`}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-70"
                        onError={(e) => e.currentTarget.src = getPlaceholderImage('banner')} // Fallback if processed image fails
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-light via-primary-light/50 to-transparent dark:from-primary-dark dark:via-primary-dark/50 dark:to-transparent"></div>
                </div>
                
                {/* Content */} 
                <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                    <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                        {/* Left Side */} 
                        <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                            {/* NFT Logo Image */} 
                            <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square">
                                <img 
                                    src={nftLogoImage}
                                    alt={`${nftTitle} Logo`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.currentTarget.src = getPlaceholderImage('collection')} // Fallback
                                />
                            </div>
                            {/* Info Column */} 
                            <div className="flex flex-col w-full min-w-0">
                                {/* Row 1: Title & Verified Badge (Removed verified badge) */} 
                                <div className="flex items-center min-w-0 mb-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark truncate" title={nftTitle}>{nftTitle}</h1>
                                    {/* Verified badge logic removed as 'verified' field is gone */}
                                </div>
                                {/* Row 2: Meta Tags */} 
                                <div className="flex w-full gap-2 flex-wrap md:flex-nowrap text-xs text-gray-600 dark:text-gray-400">
                                    <span>By <Link
                                        href={`/users/${collectionData.user?.id || '#'}`}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                        legacyBehavior>{creatorName}</Link></span>
                                    <span>·</span>
                                    <span>Created {formatDate(collectionData.createdAt.toISOString())}</span>
                                    {/* Removed Chain and Category tags */}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side Actions (Top) */} 
                        <div className="mt-3 flex w-full flex-wrap items-center justify-start gap-2 lg:mt-0 lg:w-auto lg:justify-end">
                           {collectionData.mintAddress && (
                             <Link
                                 href={`https://explorer.solana.com/address/${collectionData.mintAddress}?cluster=devnet`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm bg-transparent border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                                 legacyBehavior>
                                <FiExternalLink /> View on Explorer
                            </Link>
                           )}
                            <WatchlistButton />
                            {/* More Options Dropdown */} 
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                                    className="p-2.5 rounded-lg border bg-transparent border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                                    aria-label="More options"
                                >
                                    <FiMoreHorizontal className="w-4 h-4" />
                                </button>
                                {showMoreOptions && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-primary-light dark:bg-card-dark rounded-md shadow-lg z-20 border border-gray-200 dark:border-zinc-700"
                                    >
                                        <ul className="py-1">
                                            <li><button onClick={copyLinkToClipboard} className="w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"><FiCopy/> Copy Link</button></li>
                                            <li><button onClick={shareOnTwitter} className="w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"><FiTwitter/> Share on Twitter</button></li>
                                            <li><button onClick={shareViaEmail} className="w-full text-left px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"><FiMail/> Share via Email</button></li>
                                            {/* Add more options here if needed */}
                                        </ul>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
                {/* Stats Bar - Updated for full collection stats */} 
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-200 dark:bg-zinc-700 mb-8 shadow">
                    <StatItem title="Price" value={formatCurrency(price, collectionData.priceCurrency)} />
                    <StatItem title="Top Offer" value={formatCurrency(topOffer, collectionData.priceCurrency)} />
                    <StatItem title="Volume (24h)" value={formatCurrency(volume24h, collectionData.priceCurrency)} />
                    <StatItem title="Sales (24h)" value={formatStat(collectionData.stats?.sales24h)} />
                    <StatItem title="Items" value={formatStat(collectionData.derivedItemsCount)} /> 
                    <StatItem title="Listed" value={formatStat(collectionData.derivedListedCount)} />
                    <StatItem title="Owners" value={formatStat(collectionData.derivedOwnerCount)} />
                </div>

                {/* About this Property & Details (Tabs or sections) */} 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Left Column: About */} 
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">About this Property</h2>
                        {collectionData.nftDescription ? (
                            <div className="text-gray-700 dark:text-gray-300 space-y-3 text-sm leading-relaxed">
                                <p className={`${!showFullDescription && 'max-h-24 overflow-hidden relative'} `}>
                                    {collectionData.nftDescription}
                                    {!showFullDescription && collectionData.nftDescription.length > 150 && (
                                        <span className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary-light dark:from-primary-dark to-transparent"></span>
                                    )}
                                </p>
                                {collectionData.nftDescription.length > 150 && (
                                    <button 
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                                    >
                                        {showFullDescription ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">No description available for this property.</p>
                        )}
                        {/* Displaying some core LandListing fields */} 
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
                            <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-3">Property Details</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                {/* Removed propertyAddress and propertyType as they are not in the schema */}
                                {collectionData.propertyAreaSqm && <DetailItem label="Area (sq m)" value={collectionData.propertyAreaSqm ? `${collectionData.propertyAreaSqm.toLocaleString()} sqm` : null} />}
                                {collectionData.cadastralNumber && <DetailItem label="Cadastral No." value={collectionData.cadastralNumber} />}
                                {collectionData.permittedUse && <DetailItem label="Permitted Use" value={collectionData.permittedUse} />}
                                {collectionData.ownershipForm && <DetailItem label="Ownership Form" value={collectionData.ownershipForm} />}
                                {collectionData.egrnRecordStatus && <DetailItem label="EGRN Status" value={collectionData.egrnRecordStatus} />}
                                {/* Add more LandListing fields here as desired */}
                            </dl>
                        </div>
                    </div>

                    {/* Right Column: Key Info / Actions - Simplified */} 
                    <div className="md:col-span-1 space-y-6">
                        {/* Price Info Box (if listed) */}
                        {collectionData.isListedForSale && collectionData.listingPrice && (
                            <div className="bg-gray-50 dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
                                <p className="text-3xl font-bold text-text-light dark:text-text-dark mb-3">
                                    {formatCurrency(collectionData.listingPrice, collectionData.priceCurrency)}
                                </p>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                                    Buy Now (Action TBD)
                                </button>
                                {/* Offer button can be added here if offer system is in place for single NFTs */}
                            </div>
                        )}
                        
                        {/* NFT Mint Info */} 
                        {collectionData.mintAddress && (
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                                <h3 className="text-md font-semibold text-text-light dark:text-text-dark mb-2">Blockchain Details</h3>
                                <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-400 break-all">
                                    <p><strong>Mint Address:</strong> <CopyableText text={collectionData.mintAddress} /></p>
                                    {collectionData.metadataUri && <p><strong>Metadata:</strong> <Link href={collectionData.metadataUri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Arweave</Link></p>}
                                    {collectionData.onChainOwnerPublicKey && <p><strong>Owner Public Key:</strong> <CopyableText text={collectionData.onChainOwnerPublicKey} /></p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Item Activity / History Section - Placeholder for now */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Item Activity</h2>
                    <div className="p-6 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-center">
                        <FiInfo className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Item activity and transaction history will be displayed here.</p>
                    </div>
                </div>
                
                {/* Removed: Section for displaying individual NFTs (NFTCardSimple) */}

            </div>
            {/* Toast Notification for Copy Link */}
            {showToast && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
                >
                    <FiCheckCircle className="text-green-500"/> {toastMessage}
                </motion.div>
            )}
        </motion.div>
    );
};



export default SingleCollectionPage;