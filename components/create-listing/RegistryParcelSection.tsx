import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';

// Define the specific file field name(s) used in this component
export type RegistryParcelFileFieldNames = 'surveyPlanFile';

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
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
      transition={{ delay: 0.3 }} // Adjust delay as needed
      className="space-y-6 bg-primary-light dark:bg-primary-dark p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark border-b border-gray-300 dark:border-zinc-700 pb-2 mb-4">Registry & Parcel Identifiers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Parcel Number */}
        <div>
          <label htmlFor="parcelNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Parcel Number / APN {<span className="text-red-500">*</span>}</label>
          <input
            type="text"
            id="parcelNumber"
            name="parcelNumber"
            value={formData.parcelNumber}
            onChange={handleInputChange}
            required
            placeholder="e.g., 123-456-789-00"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* Registry Volume */}
        <div>
          <label htmlFor="registryVolume" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Registry Volume</label>
          <input
            type="text"
            id="registryVolume"
            name="registryVolume"
            value={formData.registryVolume}
            onChange={handleInputChange}
            placeholder="e.g., Vol 542"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* Registry Page */}
        <div>
          <label htmlFor="registryPage" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Registry Page</label>
          <input
            type="text"
            id="registryPage"
            name="registryPage"
            value={formData.registryPage}
            onChange={handleInputChange}
            placeholder="e.g., Page 123"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* Survey Plan Upload */}
        <FileInputField
          id="surveyPlanFile"
          label="Survey Plan / Plat Map Upload"
          accept=".pdf,.dwg,.dxf,.jpg,.png"
          file={formData.surveyPlanFile}
          previewUrl={filePreviews.surveyPlanFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'surveyPlanFile')}
        />
        {/* Survey Plan Number */}
        <div>
          <label htmlFor="surveyPlanNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Survey Plan Number</label>
          <input
            type="text"
            id="surveyPlanNumber"
            name="surveyPlanNumber"
            value={formData.surveyPlanNumber}
            onChange={handleInputChange}
            placeholder="e.g., SP-2023-005"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* Survey Date */}
        <div>
          <label htmlFor="surveyDate" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Survey Date</label>
          <input
            type="date"
            id="surveyDate"
            name="surveyDate"
            value={formData.surveyDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RegistryParcelSection;
