import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import { FormDataInterface } from '../../types/createListing'; 

interface NftDetailsProps {
  formData: FormDataInterface;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: keyof FormDataInterface) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
}

const NftDetailsSection: React.FC<NftDetailsProps> = ({
  formData,
  handleInputChange,
  handleFileChange,
  handleDrop,
  filePreviews,
  inputFieldStyles,
  inputFieldDisabledStyles,
  isSubmitting
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.08) 50%, transparent 52%)",
            "linear-gradient(225deg, transparent 48%, rgba(0,0,0,0.08) 50%, transparent 52%)",
            "linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.08) 50%, transparent 52%)",
          ],
        }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      
      <motion.h2 
        className="text-2xl font-mono uppercase tracking-wider text-black dark:text-white mb-8 flex items-center"
        whileHover={{ textShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
      >
        <motion.span 
          className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black mr-4 flex items-center justify-center text-lg font-bold font-mono border border-black/30 dark:border-white/30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          7
        </motion.span>
        NFT DETAILS
      </motion.h2>

      {/* NFT Metadata */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="nftTitle" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">NFT Title *</label>
          <input
            type="text"
            id="nftTitle"
            name="nftTitle"
            value={formData.nftTitle}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., Prime Real Estate Token #001"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="listingPrice" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Listing Price *</label>
          <div className="flex">
          <input
            type="number"
              id="listingPrice"
            name="listingPrice"
              value={formData.listingPrice}
            onChange={handleInputChange}
              className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} rounded-r-none`}
              placeholder="0.00"
              step="0.001"
            disabled={isSubmitting}
            />
          <select
              id="priceCurrency"
            name="priceCurrency"
              value={formData.priceCurrency}
            onChange={handleInputChange}
              className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} rounded-l-none border-l-0 w-24`}
            disabled={isSubmitting}
          >
            <option value="ETH">ETH</option>
              <option value="MATIC">MATIC</option>
              <option value="USD">USD</option>
          </select>
        </div>
        </motion.div>
      </motion.div>

      {/* NFT Description */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          NFT DESCRIPTION
        </motion.h3>
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <label htmlFor="nftDescription" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Description *</label>
        <textarea
            id="nftDescription"
          name="nftDescription"
            value={formData.nftDescription}
            onChange={handleInputChange}
          rows={4}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="Detailed description of the NFT and underlying property..."
          disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

      {/* NFT Image */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          NFT IMAGE
        </motion.h3>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="nftImageFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            NFT Image Upload *
          </label>
        <FileInputField
            id="nftImageFile" 
            label="" 
            accept=".jpg,.jpeg,.png,.gif,.webp"
            file={formData.nftImageFile} 
            previewUrl={filePreviews.nftImageFile || null} 
            onChange={handleFileChange} 
            onDrop={(e) => handleDrop(e, 'nftImageFile')} 
          />
        </motion.div>
      </motion.div>

      {/* Collection Information */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          COLLECTION DETAILS
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="nftCollectionSize" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Collection Size</label>
            <input
              type="number"
              id="nftCollectionSize"
              name="nftCollectionSize"
              value={formData.nftCollectionSize}
              onChange={handleInputChange}
              className={inputFieldDisabledStyles}
              readOnly
              disabled
            />
            <motion.p 
              className="mt-2 text-xs text-black/60 dark:text-white/60 font-mono"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              DEFAULT: 10 TOKENS PER COLLECTION
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Additional Notes */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          ADDITIONAL NOTES
        </motion.h3>
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <label htmlFor="additionalNotes" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Additional Notes</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            rows={3}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="Any additional information, special terms, or notes..."
            disabled={isSubmitting} 
        />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NftDetailsSection;
