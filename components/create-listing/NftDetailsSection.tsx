import React from 'react';
import { FormDataInterface } from '@/types/createListing'; 
import FileInputField from '@/components/common/FileInputField'; 

export type NftDetailsFileFieldNames = 'nftImageFile';

interface NftDetailsProps {
  formData: Pick<FormDataInterface, 'nftTitle' | 'listingPrice' | 'priceCurrency' | 'nftCollectionSize' | 'nftDescription' | 'nftImageFile'>; 
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, fieldName: NftDetailsFileFieldNames) => void; 
  filePreviews: Partial<Record<NftDetailsFileFieldNames, string | string[]>>; 
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
  isSubmitting,
}) => {
  return (
    <div className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">7</span>
        NFT Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nftTitle" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">NFT Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="nftTitle"
            id="nftTitle"
            value={formData.nftTitle || ''}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
            placeholder="e.g., Serene Hilltop Acre Lot #1"
            required
          />
        </div>
        <div>
          <label htmlFor="listingPrice" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">Listing Price <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="listingPrice"
            id="listingPrice"
            value={formData.listingPrice || ''}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
            placeholder="e.g., 10.5"
            step="any" 
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priceCurrency" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">Price Currency</label>
          <select
            name="priceCurrency"
            id="priceCurrency"
            value={formData.priceCurrency || 'ETH'}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          >
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            
          </select>
        </div>
        <div>
          <label htmlFor="nftCollectionSize" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">NFT Collection Size</label>
          <input
            type="number"
            name="nftCollectionSize"
            id="nftCollectionSize"
            value={formData.nftCollectionSize || 100} 
            className={inputFieldDisabledStyles} 
            disabled 
            readOnly
          />
        </div>
      </div>

      <div className="col-span-full">
        <label htmlFor="nftDescription" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">NFT Description <span className="text-red-500">*</span></label>
        <textarea
          name="nftDescription"
          id="nftDescription"
          rows={4}
          value={formData.nftDescription || ''}
          onChange={handleInputChange}
          className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} min-h-[80px]`}
          disabled={isSubmitting}
          placeholder="Detailed description of the land parcel for the NFT..."
          required
        />
      </div>

      <div>
        <label htmlFor="nftImageFile" className="block text-sm font-medium text-text-light dark:text-text-dark opacity-80 mb-1">NFT Image <span className="text-red-500">*</span></label>
        <FileInputField
            id="nftImageFile" 
            label="" 
            accept="image/*" 
            file={formData.nftImageFile} 
            previewUrl={filePreviews.nftImageFile || null} 
            onChange={handleFileChange} 
            onDrop={(e) => handleDrop(e, 'nftImageFile')} 
            disabled={isSubmitting} 
            // multiple={false} 
            // required 
        />
      </div>
    </div>
  );
};

export default NftDetailsSection;
