import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import { FormDataInterface } from '../../types/createListing';

// Define the specific file field names used in this component
export type AdditionalInfoFileFieldNames = 
  | 'propertyPhotosFile'
  | 'propertyValuationFile'
  | 'zoningComplianceFile';

interface AdditionalInfoProps {
  formData: FormDataInterface;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
      transition={{ delay: 1.0 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(225deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(225deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 14, repeat: Infinity }}
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
          5
        </motion.span>
        ADDITIONAL INFORMATION
      </motion.h2>
      
        {/* Property Description */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <label htmlFor="propertyDescription" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Property Description</label>
          <textarea
            id="propertyDescription"
            name="propertyDescription"
            value={formData.propertyDescription}
            onChange={handleInputChange}
            rows={4}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="Detailed description of the property, location, features, etc."
            disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

        {/* Property Photos */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          PROPERTY PHOTOS
        </motion.h3>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="propertyPhotosFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            Property Photos Upload
          </label>
        <FileInputField
          id="propertyPhotosFile"
            label=""
            accept=".jpg,.jpeg,.png,.webp"
            file={formData.propertyPhotosFile as File | null}
          previewUrl={filePreviews.propertyPhotosFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'propertyPhotosFile')}
            multiple={true}
        />
        </motion.div>
      </motion.div>

        {/* Property Valuation */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          PROPERTY VALUATION
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="propertyValuation" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Valuation Amount</label>
          <input
              type="number"
            id="propertyValuation"
            name="propertyValuation"
            value={formData.propertyValuation}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., 500000"
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="valuationDate" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Valuation Date</label>
          <input
            type="date"
            id="valuationDate"
            name="valuationDate"
            value={formData.valuationDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="md:col-span-2">
            <label htmlFor="propertyValuationFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Valuation Report Upload
            </label>
        <FileInputField
          id="propertyValuationFile"
              label=""
              accept=".pdf,.doc,.docx"
          file={formData.propertyValuationFile}
          previewUrl={filePreviews.propertyValuationFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'propertyValuationFile')}
        />
          </motion.div>
        </div>
      </motion.div>

      {/* Zoning Information */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          ZONING INFORMATION
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="zoningClassification" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Zoning Classification</label>
          <input
            type="text"
            id="zoningClassification"
            name="zoningClassification"
            value={formData.zoningClassification}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., R-1, Commercial, Industrial"
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="zoningComplianceFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Zoning Compliance Upload
            </label>
        <FileInputField
          id="zoningComplianceFile"
              label=""
              accept=".pdf,.doc,.docx"
          file={formData.zoningComplianceFile}
          previewUrl={filePreviews.zoningComplianceFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'zoningComplianceFile')}
        />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdditionalInfoSection;
