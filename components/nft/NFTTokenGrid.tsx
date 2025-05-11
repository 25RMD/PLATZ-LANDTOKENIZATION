import React, { useState } from 'react';
import { FiExternalLink, FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Token {
  tokenId: string;
  tokenURI: string;
  ownerAddress: string;
  isListed: boolean;
  listingPrice: number;
}

interface NFTTokenGridProps {
  tokens: Token[];
  contractAddress: string;
  onPurchase: (tokenId: string) => void;
  mainTokenId: string;
}

const NFTTokenGrid: React.FC<NFTTokenGridProps> = ({ 
  tokens, 
  contractAddress, 
  onPurchase,
  mainTokenId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 20;
  
  // Sort tokens by tokenId
  const sortedTokens = [...tokens].sort((a, b) => parseInt(a.tokenId, 10) - parseInt(b.tokenId, 10));
  
  // Calculate pagination
  const indexOfLastToken = currentPage * tokensPerPage;
  const indexOfFirstToken = indexOfLastToken - tokensPerPage;
  const currentTokens = sortedTokens.slice(indexOfFirstToken, indexOfLastToken);
  const totalPages = Math.ceil(sortedTokens.length / tokensPerPage);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        NFT Tokens in Collection
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentTokens.map(token => (
          <motion.div
            key={token.tokenId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`border ${token.tokenId === mainTokenId ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-zinc-700'} rounded-lg overflow-hidden bg-white dark:bg-zinc-800 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${token.tokenId === mainTokenId ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  Token #{token.tokenId}
                </span>
                {token.tokenId === mainTokenId && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                Owner: {token.ownerAddress.substring(0, 6)}...{token.ownerAddress.substring(38)}
              </div>
              
              <div className="flex flex-col space-y-2">
                {token.isListed && (
                  <button
                    onClick={() => onPurchase(token.tokenId)}
                    className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-1" size={12} /> 
                    Buy {token.listingPrice} ETH
                  </button>
                )}
                
                <a
                  href={`https://sepolia.etherscan.io/token/${contractAddress}?a=${token.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-2 py-1 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 text-xs rounded flex items-center justify-center"
                >
                  <FiExternalLink className="mr-1" size={12} /> 
                  View
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              Previous
            </button>
            
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default NFTTokenGrid;
