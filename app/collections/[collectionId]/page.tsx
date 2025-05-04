"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters
import { motion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft, FiStar, FiInfo, FiCopy, FiX, FiMoreHorizontal } from 'react-icons/fi';
import Link from 'next/link';

import { Collection } from '@/lib/interdace'; // Base collection type
import { NFT } from '@prisma/client'; // NFT type from Prisma
import NFTCardSimple from '@/components/NFTCardSimple'; // The card we just created
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTCardSimpleSkeleton from '@/components/skeletons/NFTCardSimpleSkeleton'; // Import skeleton

// Define the expected structure from the API: flat structure combining Collection and NFTs
interface CollectionWithNFTs extends Collection { // Extends base Collection type
    nfts: NFT[];
}

const SingleCollectionPage = () => {
    const params = useParams(); // Get route parameters
    const collectionId = params?.collectionId as string;

    const [collectionData, setCollectionData] = useState<CollectionWithNFTs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!collectionId) {
            // Should not happen if routing is set up correctly, but good practice
            setError("Collection ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchCollection = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/collections/${collectionId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data: CollectionWithNFTs = await response.json();
                setCollectionData(data);
            } catch (err: any) {
                console.error("Failed to fetch collection:", err);
                setError(err.message || "Failed to load collection data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, [collectionId]); // Re-fetch if collectionId changes (though unlikely in standard nav)

    if (isLoading) {
        // Render full page skeleton if still loading initial data
        return (
            <div className="animate-pulse">
                {/* Skeleton Header */}
                <div className="bg-gray-300 dark:bg-zinc-700 relative w-full">
                    {/* Banner Skeleton */}
                    <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] xl:min-w-full bg-gray-400 dark:bg-zinc-600"></div>
                    {/* Content Skeleton */}
                    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                        <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                            {/* Left Side Skeleton */}
                            <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                                {/* Logo Skeleton */}
                                <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square"></div>
                                {/* Info Column Skeleton */}
                                <div className="flex flex-col w-full min-w-0">
                                    {/* Row 1: Title & Verified Badge */}
                                    <div className="flex items-center min-w-0 mb-2">
                                        <div className="h-8 bg-gray-400 rounded w-3/4"></div>
                                        <div className="w-6 h-6 bg-gray-400 rounded-full ml-2"></div>
                                    </div>
                                    {/* Row 2: Meta Tags Skeleton */}
                                    <div className="flex w-full gap-2 flex-wrap md:flex-nowrap">
                                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Right Side Skeleton: Stats & Actions */}
                            <div className="flex min-w-0 flex-col items-end gap-4 pt-4 lg:pt-0">
                                {/* Action Buttons Skeleton */}
                                <div className="flex h-8 items-center justify-end gap-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                                </div>
                                {/* Stats Bar Skeleton */}
                                <div className="flex items-center overflow-hidden md:gap-8 w-full justify-between flex-wrap">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2">
                                            <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                                            <div className="h-5 bg-gray-400 rounded w-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Body */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <div className="h-48 bg-gray-300 dark:bg-zinc-700 rounded-md"></div>
                                </div>
                                <div className="p-6 pt-0">
                                    <div className="h-5 bg-gray-400 dark:bg-zinc-600 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-1/2"></div>
                                </div>
                                <div className="items-center p-6 pt-0 flex justify-between">
                                    <div className="h-9 bg-gray-400 dark:bg-zinc-600 rounded w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Error loading collection</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Link href="/" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                        Go back home
                    </a>
                </Link>
            </div>
        );
    }

    if (!collectionData) { // Check if collectionData itself is null/undefined (now expects flat structure)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <FiAlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-semibold">Collection not found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">The requested collection could not be found.</p>
                <Link href="/" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                        Go back home
                    </a>
                </Link>
            </div>
        );
    }

    // Use collectionData directly for both collection details and NFTs
    const { nfts } = collectionData; // NFTs are directly on collectionData

    return (
        <>
            {/* Header Section */}
            <header className="bg-gray-50 dark:bg-zinc-800/50 relative w-full">
                {/* Banner Image Container with Gradient */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 dark:to-black/80 z-[2]"></div>
                    {collectionData.image && (
                        <img
                            src={collectionData.image}
                            alt={`${collectionData.name} banner`}
                            decoding="async"
                            data-nimg="fill"
                            className="h-full w-full object-cover object-center"
                            style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
                        />
                    )}
                    {/* Fallback background if no image */}
                    {!collectionData.image && (
                        <div className="absolute inset-0 bg-gray-300 dark:bg-zinc-700 z-[1]"></div>
                    )}
                </div>

                {/* Spacer div to push content down and define aspect ratio */}
                <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] xl:min-w-full"></div>

                {/* Content (Logo, Title, Stats, etc.) positioned absolutely */}
                <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                    <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                        {/* Left Side: Logo, Title, Creator, Meta Tags */}
                        <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                            {/* Collection Logo */}
                            <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square">
                                {collectionData.image ? (
                                    <img
                                        src={collectionData.image}
                                        alt={`${collectionData.name} logo`}
                                        decoding="async"
                                        data-nimg="fill"
                                        className="h-full w-full object-cover object-center"
                                        style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center text-gray-500">
                                        No Logo
                                    </div>
                                )}
                            </div>
                            {/* Info Column */}
                            <div className="flex flex-col w-full min-w-0">
                                {/* Row 1: Title & Verified Badge */}
                                <div className="flex items-center min-w-0">
                                    <h1 className="text-xl md:text-3xl font-bold truncate text-white select-text">
                                        {collectionData.name}
                                    </h1>
                                    {collectionData.verified && (
                                        <div className="ml-2 shrink-0">
                                            {/* Verified Badge Placeholder */}
                                            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Row 2: Meta Tags (Creator, Chain, Supply, etc.) */}
                                <div className="flex w-full gap-2 flex-wrap">
                                    <div className="flex items-center h-[18px] w-fit whitespace-nowrap rounded px-1.5 py-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 font-mono text-xs">
                                        <div className="truncate break-all max-w-[150px]">By {collectionData.creator}</div>
                                        {/* Add verified check for creator if available */}
                                    </div>
                                    {/* Chain Tag */}
                                    <div className="flex items-center h-[18px] w-fit whitespace-nowrap rounded px-1.5 py-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 font-mono text-xs gap-1">
                                        {/* Chain Icon Placeholder */}
                                        <div className="h-2.5 w-2.5 bg-gray-400 dark:bg-zinc-500 rounded-full"></div> SOL
                                    </div>
                                    {/* Supply Tag */}
                                    <div className="flex items-center h-[18px] w-fit whitespace-nowrap rounded px-1.5 py-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 font-mono text-xs gap-1">
                                        <svg aria-label="Stacks" className="fill-current" height="12" role="img" viewBox="0 -960 960 960" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M480-400 40-640l440-240 440 240-440 240Zm0 160L63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Z"></path></svg>
                                        <span className="font-mono">{collectionData.items?.toLocaleString() ?? 'N/A'}</span>
                                    </div>
                                    {/* Creation Date Tag */}
                                    <div className="flex items-center h-[18px] w-fit whitespace-nowrap rounded px-1.5 py-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 font-mono text-xs">
                                        {/* Placeholder for creation date */}
                                        May 2025
                                    </div>
                                    {/* Category Tag */}
                                    <div className="flex items-center h-[18px] w-fit whitespace-nowrap rounded px-1.5 py-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 font-mono text-xs capitalize">
                                        {collectionData.category}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Stats & Actions */}
                        <div className="flex min-w-0 flex-col items-end gap-4 pt-4 lg:pt-0">
                            {/* Action Buttons (Share, Watchlist, More) */}
                            <div className="flex h-8 items-center justify-end gap-3">
                                {/* Placeholder Action Buttons */}
                                <button className="p-1.5 rounded-lg border border-gray-300/50 dark:border-zinc-600/50 text-white/80 hover:bg-white/10">
                                    <FiInfo className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 rounded-lg border border-gray-300/50 dark:border-zinc-600/50 text-white/80 hover:bg-white/10">
                                    <FiCopy className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 rounded-lg border border-gray-300/50 dark:border-zinc-600/50 text-white/80 hover:bg-white/10">
                                    <FiX className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 rounded-lg border border-gray-300/50 dark:border-zinc-600/50 text-white/80 hover:bg-white/10">
                                    <FiStar className="w-5 h-5" />
                                </button>
                                <button className="p-1.5 rounded-lg border border-gray-300/50 dark:border-zinc-600/50 text-white/80 hover:bg-white/10">
                                    <FiMoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats Bar (Floor, Offer, Volume, etc.) */}
                            <div className="flex items-center overflow-hidden md:gap-8 w-full justify-between flex-wrap">
                                {/* Floor Price */}
                                <div className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2 text-white">
                                    <span className="leading-tight font-mono text-xs opacity-60">Floor price</span>
                                    <span className="leading-tight font-mono text-sm font-medium inline-flex items-center gap-1">
                                        {/* Price Icon Placeholder? */}
                                        {collectionData.floorPrice} SOL
                                    </span>
                                </div>
                                {/* Top Offer */}
                                <div className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2 text-white">
                                    <span className="leading-tight font-mono text-xs opacity-60">Top offer</span>
                                    <span className="leading-tight font-mono text-sm font-medium inline-flex items-center gap-1">
                                        {collectionData.topOffer?.toLocaleString() ?? 'N/A'} SOL
                                    </span>
                                </div>
                                {/* Total Volume */}
                                <div className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2 text-white">
                                    <span className="leading-tight font-mono text-xs opacity-60">Total volume</span>
                                    <span className="leading-tight font-mono text-sm font-medium inline-flex items-center gap-1">
                                        {collectionData.volume.toLocaleString()} SOL
                                    </span>
                                </div>
                                {/* Listed % */}
                                <div className="hidden md:flex flex-col items-start gap-1 whitespace-nowrap select-text py-2 text-white">
                                    <span className="leading-tight font-mono text-xs opacity-60">Listed</span>
                                    <span className="leading-tight font-mono text-sm font-medium">
                                        {collectionData.items > 0 ? `${((collectionData.listedCount / collectionData.items) * 100).toFixed(1)}%` : 'N/A'}
                                    </span>
                                </div>
                                {/* Owners (Unique) */}
                                <div className="hidden md:flex flex-col items-start gap-1 whitespace-nowrap select-text py-2 text-white">
                                    <span className="leading-tight font-mono text-xs opacity-60">Owners (Unique)</span>
                                    <span className="leading-tight font-mono text-sm font-medium">
                                        {collectionData.ownerCount?.toLocaleString() ?? 'N/A'}
                                        {/* Add % unique owners if calculable/available */}
                                        {/* ({collectionData.items > 0 ? `${((collectionData.ownerCount / collectionData.items) * 100).toFixed(1)}%` : 'N/A'}) */}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area below header */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Display NFTs */}
                {nfts && nfts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {nfts.map((nft) => (
                            <NFTCardSimple key={nft.id} nft={nft} collectionTotalItems={collectionData.items ?? 0} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold">No NFTs found in this collection yet.</h2>
                        <p className="text-gray-500 dark:text-gray-400">Check back later or explore other collections.</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default SingleCollectionPage;