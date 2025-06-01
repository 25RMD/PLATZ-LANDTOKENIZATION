import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';

// Define the specific file field names used in this component
export type RegistryParcelFileFieldNames = 'surveyPlanFile';

// Define the structure of the expected formData subset
export interface RegistryParcelFormData {
  parcelNumber: string;
  registryVolume: string;
  registryPage: string;
  surveyPlanFile: File | null;
  surveyPlanNumber: string;
  surveyDate: string;
}

interface RegistryParcelProps {
  formData: RegistryParcelFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: RegistryParcelFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
}

const RegistryParcelSection: React.FC<RegistryParcelProps> = ({ 
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
      transition={{ delay: 0.4 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(135deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
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
          2
        </motion.span>
        REGISTRY & PARCEL IDENTIFIERS
      </motion.h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="parcelNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Parcel Number *</label>
          <input
            type="text"
            id="parcelNumber"
            name="parcelNumber"
            value={formData.parcelNumber}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., P123456789"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="registryVolume" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Registry Volume</label>
          <input
            type="text"
            id="registryVolume"
            name="registryVolume"
            value={formData.registryVolume}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., Volume 42"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="registryPage" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Registry Page</label>
          <input
            type="text"
            id="registryPage"
            name="registryPage"
            value={formData.registryPage}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., Page 1024"
            disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

      {/* Survey Plan Section */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          SURVEY PLAN
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="surveyPlanFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Survey Plan Document
            </label>
            <FileInputField
              id="surveyPlanFile"
              label=""
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.surveyPlanFile}
              previewUrl={filePreviews.surveyPlanFile || null}
              onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'surveyPlanFile')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="surveyPlanNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Survey Plan Number</label>
            <input
              type="text"
              id="surveyPlanNumber"
              name="surveyPlanNumber"
              value={formData.surveyPlanNumber}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., SP987654321"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="surveyDate" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Survey Date</label>
            <input
              type="date"
              id="surveyDate"
              name="surveyDate"
              value={formData.surveyDate}
              onChange={handleInputChange}
              className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
              disabled={isSubmitting}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegistryParcelSection;
