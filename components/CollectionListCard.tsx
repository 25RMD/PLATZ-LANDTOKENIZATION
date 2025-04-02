import { Collection } from "@/lib/interdace";
import React from "react";

const CollectionListCard = ({ collection }: { collection: Collection }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
      <div className="flex items-center p-4">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden mr-4">
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          {collection.verified && (
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{collection.name}</h3>
            <span className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs">
              {collection.floorPrice} ETH floor
            </span>
          </div>
          <p className="text-gray-400 text-sm">by {collection.creator}</p>
        </div>
        <div className="hidden md:flex text-right ml-8">
          <div className="mr-8">
            <p className="text-gray-500 text-sm">Items</p>
            <p className="text-white">{collection.items.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Volume</p>
            <p className="text-white">
              {collection.volume.toLocaleString()} ETH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionListCard;
