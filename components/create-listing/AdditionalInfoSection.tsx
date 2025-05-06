import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';

// Define the specific file field names used in this component
export type AdditionalInfoFileFieldNames = 
  | 'propertyPhotosFile'
  | 'propertyValuationFile'
  | 'zoningComplianceFile';

// Define the structure of the expected formData subset
export interface AdditionalInfoFormData {
  propertyDescription: string;
  propertyPhotosFile: File[] | null; // Allow multiple photos
  propertyValuation: string;
  propertyValuationFile: File | null;
  valuationDate: string;
  zoningClassification: string;
  zoningComplianceFile: File | null;
  status: 'DRAFT' | 'ACTIVE' | 'PENDING';
}

interface AdditionalInfoProps {
  formData: AdditionalInfoFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: AdditionalInfoFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
}

const AdditionalInfoSection: React.FC<AdditionalInfoProps> = ({ 
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
      transition={{ delay: 0.7 }} // Adjust delay
      className="space-y-6 bg-primary-light dark:bg-primary-dark p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark border-b border-gray-300 dark:border-zinc-700 pb-2 mb-4">Additional Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property Description */}
        <div className="md:col-span-2 lg:col-span-3">
          <label htmlFor="propertyDescription" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Property Description</label>
          <textarea
            id="propertyDescription"
            name="propertyDescription"
            value={formData.propertyDescription}
            onChange={handleInputChange}
            rows={5}
            placeholder="Provide a detailed description of the land, features, potential uses, etc."
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} min-h-[100px]`}
            disabled={isSubmitting}
          />
        </div>
        {/* Property Photos */}
        {/* TODO: Enhance FileInputField to handle multiple files */}
        <FileInputField
          id="propertyPhotosFile"
          label="Property Photos Upload"
          accept="image/*"
          multiple
          file={formData.propertyPhotosFile} 
          previewUrl={filePreviews.propertyPhotosFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'propertyPhotosFile')}
          disabled={isSubmitting}
        />
        {/* Property Valuation */}
        <div>
          <label htmlFor="propertyValuation" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Property Valuation Amount (USD)</label>
          <input
            type="number" // Use number type for currency
            step="0.01" // Allow decimals
            id="propertyValuation"
            name="propertyValuation"
            value={formData.propertyValuation}
            onChange={handleInputChange}
            placeholder="e.g., 150000.00"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="valuationDate" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Valuation Date</label>
          <input
            type="date"
            id="valuationDate"
            name="valuationDate"
            value={formData.valuationDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
        <FileInputField
          id="propertyValuationFile"
          label="Valuation Report Upload"
          accept=".pdf"
          file={formData.propertyValuationFile}
          previewUrl={filePreviews.propertyValuationFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'propertyValuationFile')}
        />
        {/* Zoning */}
        <div>
          <label htmlFor="zoningClassification" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Zoning Classification</label>
          <input
            type="text"
            id="zoningClassification"
            name="zoningClassification"
            value={formData.zoningClassification}
            onChange={handleInputChange}
            placeholder="e.g., Residential, Commercial, Agricultural"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        <FileInputField
          id="zoningComplianceFile"
          label="Zoning Compliance/Permit Upload"
          accept=".pdf"
          file={formData.zoningComplianceFile}
          previewUrl={filePreviews.zoningComplianceFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'zoningComplianceFile')}
        />
        {/* Status Dropdown */}
        <div>
          <label htmlFor="status" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Listing Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Review</option>
            {/* Add other statuses as needed, e.g., SOLD, DELISTED */}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default AdditionalInfoSection;
