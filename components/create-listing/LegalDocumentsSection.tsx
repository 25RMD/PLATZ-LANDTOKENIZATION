import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { FaChevronDown } from 'react-icons/fa'; // Or relevant icons
import { motion } from 'framer-motion'; // <-- ADDED IMPORT

// Define the specific file field names used in this component
export type LegalDocumentsFileFieldNames = // <-- ADDED export
  | 'titleDeedFile'
  | 'titleCertFile'
  | 'encumbranceFile';

// Define the structure of the expected formData subset and filePreviews subset
export interface LegalDocumentsFormData { // <-- ADDED export
  titleDeedFile: File | null;
  deedNumber: string;
  deedType: string;
  grantorName: string;
  granteeName: string;
  deedDate: string;
  titleCertFile: File | null;
  certNumber: string;
  certIssueDate: string;
  certExpiryDate: string;
  encumbranceFile: File | null;
  encumbranceId: string;
  encumbrancePeriodStart: string;
  encumbrancePeriodEnd: string;
}

interface LegalDocumentsProps {
  formData: LegalDocumentsFormData; // Expect the specific subset
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: LegalDocumentsFileFieldNames) => void; // Use specific keys
  filePreviews: Record<string, string | string[]>; // Update to accept string[]
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean; // To disable fields during submission
}

const LegalDocumentsSection: React.FC<LegalDocumentsProps> = ({ 
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
      transition={{ delay: 0.2 }}
      className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">1</span>
        Core Legal Documents
      </h2>
      
      {/* --- Title Deed --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div> 
          <label htmlFor="titleDeedFile" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">
            Title Deed Upload <span className='text-red-500'>*</span>
          </label>
          <FileInputField
            id="titleDeedFile"
            label=""
            accept=".pdf,.jpg,.jpeg,.png"
            file={formData.titleDeedFile}
            previewUrl={filePreviews.titleDeedFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'titleDeedFile')} 
          />
        </div>
        <div>
          <label htmlFor="deedNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Deed Number {<span className="text-red-500">*</span>}</label>
          <input
            type="text"
            id="deedNumber"
            name="deedNumber"
            value={formData.deedNumber}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., TD12345678"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
           <label htmlFor="deedType" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Deed Type</label>
           <input
            type="text" // Consider <select> if types are limited
            id="deedType"
            name="deedType"
            value={formData.deedType}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., Warranty Deed, Quitclaim Deed"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="grantorName" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Grantor Name</label>
          <input
            type="text"
            id="grantorName"
            name="grantorName"
            value={formData.grantorName}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="Name of the seller/previous owner"
            disabled={isSubmitting}
          />
        </div>
         <div>
          <label htmlFor="granteeName" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Grantee Name</label>
          <input
            type="text"
            id="granteeName"
            name="granteeName"
            value={formData.granteeName}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="Name of the buyer/new owner"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="deedDate" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Date of Deed</label>
          <input
            type="date"
            id="deedDate"
            name="deedDate"
            value={formData.deedDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* --- Title Certificate --- */}
      <div className="border-t border-gray-300 dark:border-zinc-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
         <FileInputField
          id="titleCertFile"
          label="Title Certificate Document"
          accept=".pdf,.jpg,.jpeg,.png"
          file={formData.titleCertFile}
          previewUrl={filePreviews.titleCertFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'titleCertFile')} // Keep string literal, it matches the defined type
        />
        <div>
          <label htmlFor="certNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Certificate Number</label>
          <input
            type="text"
            id="certNumber"
            name="certNumber"
            value={formData.certNumber}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., TC9876543"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="certIssueDate" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Certificate Issue Date</label>
          <input
            type="date"
            id="certIssueDate"
            name="certIssueDate"
            value={formData.certIssueDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="certExpiryDate" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Certificate Expiry Date (if applicable)</label>
          <input
            type="date"
            id="certExpiryDate"
            name="certExpiryDate"
            value={formData.certExpiryDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
      </div>

       {/* --- Encumbrance Certificate --- */}
      <div className="border-t border-gray-300 dark:border-zinc-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
         <FileInputField
          id="encumbranceFile"
          label="Encumbrance Certificate Document"
          accept=".pdf,.jpg,.jpeg,.png"
          file={formData.encumbranceFile}
          previewUrl={filePreviews.encumbranceFile || null}
          onChange={handleFileChange}
          onDrop={(e) => handleDrop(e, 'encumbranceFile')} // Keep string literal, it matches the defined type
        />
        <div>
          <label htmlFor="encumbranceId" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Encumbrance ID/Reference</label>
          <input
            type="text"
            id="encumbranceId"
            name="encumbranceId"
            value={formData.encumbranceId}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., EC4567890"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="encumbrancePeriodStart" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Encumbrance Search Period Start</label>
          <input
            type="date"
            id="encumbrancePeriodStart"
            name="encumbrancePeriodStart"
            value={formData.encumbrancePeriodStart}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="encumbrancePeriodEnd" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Encumbrance Search Period End</label>
          <input
            type="date"
            id="encumbrancePeriodEnd"
            name="encumbrancePeriodEnd"
            value={formData.encumbrancePeriodEnd}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </div>
      </div>

    </motion.div>
  );
};

export default LegalDocumentsSection;
