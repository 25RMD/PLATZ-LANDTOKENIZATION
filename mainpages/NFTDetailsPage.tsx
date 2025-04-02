"use client";
import React, { useState } from "react";
import AnimatedButton from "@/components/common/AnimatedButton";
import { NFT } from "@/lib/interdace";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiClock, FiHeart, FiShare2, FiUser } from "react-icons/fi";
import { socialShare } from "@/lib/data";
import { FaEthereum } from "react-icons/fa";

const NFTDetailsPage = ({ nft }: { nft?: NFT }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m left`;
  };

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl text-white">NFT not found</h2>
        <AnimatedButton
          onClick={() => router.push("/marketplace")}
          className="mt-4"
        >
          Back to Marketplace
        </AnimatedButton>
      </div>
    );
  }

  const handlePlaceBid = () => {
    // Handle bid placement
    console.log(`Bid placed: ${bidAmount} ETH`);
    setBidAmount("");
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/2"
        >
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full ${
                  isLiked
                    ? "bg-pink-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <FiHeart className={isLiked ? "fill-current" : ""} />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className={`p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600`}
              >
                <FiShare2 />
              </button>
            </div>
          </div>
        </motion.div>

        {/* nft details  */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/2"
        >
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{nft.name}</h1>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={nft.creator.avatar}
                    alt={nft.creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Created by</p>
                  {nft.creator.verified && (
                    <span className="ml-1 text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Description
              </h2>
              <p className="text-gray-400">{nft.description}</p>
            </div>

            {nft.auctionEnd && (
              <div>
                <FiClock className="text-purple-500 mr-2" />
                <span>{formatTimeLeft(nft.auctionEnd)}</span>
              </div>
            )}

            {/* price and bid section  */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-750 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <div className="flex items-center">
                    <FaEthereum className="text-purple-500 mr-1" />
                    <span className="text-xl font-bold text-white">
                      {nft.price} ETH
                    </span>
                  </div>
                </div>
                <div className="bg-gray-750 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Highest Bid</p>
                  <div className="flex items-center">
                    <FaEthereum className="text-purple-500 mr-1" />
                    <span className="text-xl font-bold text-white">
                      {nft.highestBid} ETH
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Enter bid amount"
                    className="flex-grow bg-gray-700 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={nft.highestBid + 0.1}
                    step={0.01}
                  />
                  <AnimatedButton
                    onClick={handlePlaceBid}
                    className="rounded-l-none px-6"
                  >
                    Place Bid
                  </AnimatedButton>
                </div>
              </div>

              {/* owner info  */}
              <div className="bg-gray-750 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Owned by</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={nft.owner.avatar}
                      alt={nft.owner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white">{nft.owner.name}</p>
                </div>
              </div>

              <div className="mb-6">
                {/* tabs  */}
                <div className="mt-6">
                  <div className="flex border-b border-gray-700">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`px-4 py-2 font-medium ${
                        activeTab === "details"
                          ? "text-purple-400 border-b-2 border-purple-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Details
                    </button>

                    <button
                      onClick={() => setActiveTab("history")}
                      className={`px-4 py-2 font-medium ${
                        activeTab === "history"
                          ? "text-purple-400 border-b-2 border-purple-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-b-xl p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "details" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Properties
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {nft.properties.map((prop, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ y: -3 }}
                              className="bg-gray-750 rounded-lg p-3"
                            >
                              <p className="text-gray-400 text-sm">
                                {prop.name}
                              </p>
                              <p className="text-white font-medium">
                                {prop.value}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "history" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4">
                          History
                        </h3>
                        <div className="space-y-4">
                          {nft.history.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <div className="bg-gray-700 p-2 rounded-full mr-3">
                                  <FiUser className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-white">{item.event}</p>
                                  <p className="text-gray-400 text-sm">
                                    {item.from && `${item.from} → `}
                                    {item.to}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {item.price > 0 && (
                                  <div className="flex items-center justify-end">
                                    <FaEthereum className="text-purple-500 mr-1" />
                                    <span className="text-white">
                                      {item.price} ETH
                                    </span>
                                  </div>
                                )}
                                <p className="text-gray-400 text-sm">
                                  {item.date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Share this NFT
              </h3>
              <div className="flex space-x-4 mb-6">
                {socialShare.map((platform, index: number) => (
                  <button key={index}>
                    <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                      <platform.icon />
                    </div>
                    <span className="text-sm">{platform.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex">
                <input
                  type="text"
                  value={`http://localhost:3000/nft/${nft.id}`}
                  readOnly
                  className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-l-lg focus:outline-none"
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700">
                  Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NFTDetailsPage;
