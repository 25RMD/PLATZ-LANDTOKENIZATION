import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';

// Define the specific file field names used in this component
export type ChainOfTitleFileFieldNames = 
  | 'previousDeedFile'
  | 'titleReportFile'
  | 'titleInsuranceFile'
  | 'encumbranceHistoryFile'
  | 'titleOpinionFile';

// Define the structure of the expected formData subset 
export interface ChainOfTitleFormData {
  previousDeedFile: File | null;
  titleReportFile: File | null;
  titleInsuranceFile: File | null;
  titleInsuranceCompany: string;
  titleInsurancePolicyNumber: string;
  encumbranceDetails: string;
  encumbranceHistoryFile: File | null;
  titleOpinionFile: File | null;
  attorneyOpinionProvider: string;
}

interface ChainOfTitleProps {
  formData: ChainOfTitleFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: ChainOfTitleFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
}

const ChainOfTitleSection: React.FC<ChainOfTitleProps> = ({ 
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
      transition={{ delay: 0.6 }} // Adjust delay
      className="space-y-6 bg-primary-light dark:bg-primary-dark p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark border-b border-gray-300 dark:border-zinc-700 pb-2 mb-4">Chain-of-Title & Encumbrance History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Previous Deed(s) */}
        <FileInputField
          id="previousDeedFile"
          label="Previous Deed(s) Scan/Upload"
          accept=".pdf"
          file={formData.previousDeedFile}
          previewUrl={filePreviews.previousDeedFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'previousDeedFile')}
        />
        {/* Title Report */}
        <FileInputField
          id="titleReportFile"
          label="Title Report Scan/Upload"
          accept=".pdf"
          file={formData.titleReportFile}
          previewUrl={filePreviews.titleReportFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'titleReportFile')}
        />
        {/* Title Insurance */}
        <FileInputField
          id="titleInsuranceFile"
          label="Title Insurance Policy Upload"
          accept=".pdf"
          file={formData.titleInsuranceFile}
          previewUrl={filePreviews.titleInsuranceFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'titleInsuranceFile')}
        />
        <div>
          <label htmlFor="titleInsuranceCompany" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Title Insurance Company</label>
          <input
            type="text"
            id="titleInsuranceCompany"
            name="titleInsuranceCompany"
            value={formData.titleInsuranceCompany}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="titleInsurancePolicyNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Policy Number</label>
          <input
            type="text"
            id="titleInsurancePolicyNumber"
            name="titleInsurancePolicyNumber"
            value={formData.titleInsurancePolicyNumber}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
         {/* Encumbrance Details */}
         <div className="md:col-span-2 lg:col-span-3">
             <label htmlFor="encumbranceDetails" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Details of Known Encumbrances/Liens</label>
             <textarea
                id="encumbranceDetails"
                name="encumbranceDetails"
                value={formData.encumbranceDetails}
                onChange={handleInputChange}
                rows={4}
                placeholder="List any known mortgages, easements, liens, etc."
                className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} min-h-[80px]`}
                disabled={isSubmitting}
             />
         </div>
        {/* Encumbrance History */}
        <FileInputField
          id="encumbranceHistoryFile"
          label="Encumbrance History Document Upload"
          accept=".pdf"
          file={formData.encumbranceHistoryFile}
          previewUrl={filePreviews.encumbranceHistoryFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'encumbranceHistoryFile')}
        />
        {/* Attorney Title Opinion */}
        <FileInputField
          id="titleOpinionFile"
          label="Attorney Title Opinion Upload"
          accept=".pdf"
          file={formData.titleOpinionFile}
          previewUrl={filePreviews.titleOpinionFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'titleOpinionFile')}
        />
        <div>
          <label htmlFor="attorneyOpinionProvider" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Attorney/Firm Providing Opinion</label>
          <input
            type="text"
            id="attorneyOpinionProvider"
            name="attorneyOpinionProvider"
            value={formData.attorneyOpinionProvider}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ChainOfTitleSection;
