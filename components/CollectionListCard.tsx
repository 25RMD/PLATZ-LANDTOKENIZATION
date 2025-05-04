import { Collection } from "@/lib/interdace";
import Link from "next/link";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface CollectionListCardProps {
  collection: Collection;
}

const CollectionListCard: React.FC<CollectionListCardProps> = ({ collection }) => {
  return (
    <Link href={`/collections/${collection.id}`} passHref legacyBehavior>
      <a
        className="flex items-center p-3 bg-primary-light dark:bg-card-dark rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all duration-200 gap-4"
      >
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          {collection.verified && (
            <div className="absolute bottom-1 right-1 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 p-0.5 rounded-full shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 items-center">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark truncate" title={collection.name}>
              {collection.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">by {collection.creator}</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-sm text-text-light dark:text-text-dark opacity-60">Floor</p>
            <p className="text-sm font-semibold text-text-light dark:text-text-dark">{collection.floorPrice.toFixed(2)} SOL</p>
          </div>
          <div className="hidden sm:block min-w-[80px] text-right">
            <p className="text-sm text-text-light dark:text-text-dark opacity-60">Volume</p>
            <p className="text-sm font-semibold text-text-light dark:text-text-dark">{collection.volume.toLocaleString()} SOL</p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
            <p className="text-sm font-medium text-text-light dark:text-text-dark">{collection.items.toLocaleString()}</p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default CollectionListCard;
