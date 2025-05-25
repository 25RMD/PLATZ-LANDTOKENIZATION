"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaBoxOpen } from "react-icons/fa";
import PulsingDotsSpinner from "@/components/common/PulsingDotsSpinner";
import { NFT } from "@/lib/interdace";
import { mockNFTs } from "@/lib/data";
import NFTCard from "@/components/NFTCard";

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setTimeout(() => {
          setNfts(mockNFTs);
        }, 1000);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const filteredNFTs = nfts.filter((nft) =>
    nft.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">
        Explore NFTs
      </h1>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search NFTs, properties, or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white border border-black/10 dark:border-white/10"
          />
          <FaSearch className="absolute left-3 top-3.5 h-5 w-5 text-text-light dark:text-text-dark opacity-50" />
        </div>
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 border border-black dark:border-white text-text-light dark:text-text-dark rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            All
          </button>
          <button className="px-4 py-2 border border-black dark:border-white text-text-light dark:text-text-dark rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            Art
          </button>
          <button className="px-4 py-2 border border-black dark:border-white text-text-light dark:text-text-dark rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            Collectibles
          </button>
          {/* Add more filter buttons as needed */}
        </div>
      </div>

      {/* NFT Grid */}
      {filteredNFTs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <FaBoxOpen className="mx-auto h-16 w-16 text-text-light dark:text-text-dark opacity-50 mb-4" />
          <h3 className="text-xl text-text-light dark:text-text-dark mb-2">No NFTs found</h3>
          <p className="text-text-light dark:text-text-dark opacity-70">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
