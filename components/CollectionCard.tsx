import { Collection } from "@/lib/interdace";
import Link from "next/link";
import React from "react";

const CollectionCard = ({ collection }: { collection: Collection }) => {
  return (
    <Link href={`/collections/${collection.id}`} passHref legacyBehavior>
      <a className="block bg-primary-light dark:bg-card-dark rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md group">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />

          {collection.verified && (
            <div className="absolute top-2.5 right-2.5 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 p-1 rounded-full shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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

        <div className="p-4">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="text-base font-semibold text-text-light dark:text-text-dark flex-shrink truncate" title={collection.name}>{collection.name}</h3>
            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 whitespace-nowrap">
              {collection.floorPrice.toFixed(2)} ETH floor
            </span>
          </div>

          <p className="text-text-light dark:text-text-dark opacity-70 text-sm mb-3">by {collection.creator}</p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-text-light dark:text-text-dark opacity-60">Items</p>
              <p className="text-text-light dark:text-text-dark font-medium">{collection.items.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-text-light dark:text-text-dark opacity-60">Volume</p>
              <p className="text-text-light dark:text-text-dark font-medium">
                {collection.volume.toLocaleString()} ETH
              </p>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default CollectionCard;
