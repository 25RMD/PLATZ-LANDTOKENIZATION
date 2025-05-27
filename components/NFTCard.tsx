import { NFT } from "@/lib/interdace"; // Import from the actual file
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
interface NFTCardProps {
  nft: NFT;
  index: number;
}

const NFTCard = ({ nft, index }: NFTCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      className="rounded-xl overflow-hidden shadow-lg bg-primary-light dark:bg-card-dark border border-gray-200 dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      <div className="relative h-64 w-full">
        <Image
          src={nft.image}
          alt={nft.name}
          layout="fill"
          objectFit="cover"
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-xl font-bold text-text-light dark:text-text-dark flex-shrink truncate" title={nft.name}>{nft.name}</h3>
          <span className="bg-gray-100 dark:bg-zinc-900 text-text-light dark:text-text-dark px-2 py-1 rounded-md text-sm flex-shrink-0 whitespace-nowrap">
            {nft.price}
          </span>
        </div>
        <p className="text-text-light dark:text-text-dark opacity-70 text-sm mb-4 line-clamp-2">
          {nft.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-black/10 dark:border-white/10">
              <Image
                src={nft.creator.avatar}
                alt={nft.creator.name}
                width={32}
                height={32}
              />
            </div>
            <span className="text-text-light dark:text-text-dark opacity-80 text-sm">{nft.creator.name}</span>
          </div>

          <Link
            href={`/nft/${nft.id}`}
            passHref
            className="px-4 py-1.5 text-sm border border-black dark:border-white text-text-light dark:text-text-dark rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
