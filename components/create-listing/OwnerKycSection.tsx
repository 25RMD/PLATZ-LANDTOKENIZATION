import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

// Define the specific file field name used in this component
export type OwnerKycFileFieldNames = 'idDocumentFile';

// Define the form data structure specific to this section
export interface OwnerKycFormData {
  ownerName: string;
  ownerContact: string;
  ownerIdType: string; // Consider enum later: 'passport' | 'drivers_license' | 'national_id' | 'other'
  govIdNumber: string; // Renamed from ownerIdNumber
  idDocumentFile: File | null; // Renamed from ownerIdFile
}

interface OwnerKycProps {
  formData: OwnerKycFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: OwnerKycFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
  isVerified: boolean; // Pass verification status from parent
}

const OwnerKycSection: React.FC<OwnerKycProps> = ({ 
  formData, 
  handleInputChange, 
  handleFileChange, 
  handleDrop,
  filePreviews,
  inputFieldStyles,
  inputFieldDisabledStyles,
  isSubmitting,
  isVerified // Get verification status
}) => {
  // Derive display styles based on verification status
  const kycStatusText = isVerified ? "Verified" : "Not Verified";
  const kycStatusColor = isVerified ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }} // Adjust delay
      className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">4</span>
        Owner Identity & KYC
      </h2>
      
       {/* Display KYC status based on passed prop */}
      <div className="flex items-center space-x-2 mb-4">
          <span className="text-text-light dark:text-text-dark opacity-80 text-sm font-medium">Account KYC Status:</span>
          <span className={`font-semibold ${kycStatusColor}`}>{kycStatusText}</span>
          {!isVerified && (
             <Link href="/profile" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">(Complete KYC)</Link>
          )}
       </div>
       
       {/* Warning if KYC is not complete */} 
       {!isVerified && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 rounded-lg flex items-center space-x-2 text-sm">
             <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
             <span>Owner details provided here should match your KYC information for successful verification.</span>
          </div>
       )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Owner Full Name */}
        <div>
          <label htmlFor="ownerName" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Owner Full Name</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            placeholder="As per official documents"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* Owner Contact Info (Phone/Email) */}
        <div>
          <label htmlFor="ownerContact" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Owner Contact (Phone/Email)</label>
          <input
            type="text"
            id="ownerContact"
            name="ownerContact"
            value={formData.ownerContact}
            onChange={handleInputChange}
            placeholder="e.g., +1-555-123-4567 or owner@example.com"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* ID Type */}
        <div>
          <label htmlFor="ownerIdType" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">ID Type</label>
          <select 
             id="ownerIdType" 
             name="ownerIdType" 
             value={formData.ownerIdType} 
             onChange={handleInputChange} 
             className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
             disabled={isSubmitting}
            >
              <option value="" disabled>Select ID Type</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="national_id">National ID Card</option>
              <option value="other">Other</option>
           </select>
        </div>
        {/* ID Number */}
        <div>
          <label htmlFor="govIdNumber" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">ID Number</label>
          <input
            type="text"
            id="govIdNumber"
            name="govIdNumber"
            value={formData.govIdNumber}
            onChange={handleInputChange}
            placeholder="Enter the number matching the ID Type"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
        </div>
        {/* ID Document Upload */}
        <div> 
          <label htmlFor="idDocumentFile" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">
            ID Document Scan/Upload
          </label>
          <FileInputField
            id="idDocumentFile"
            label=""
            accept=".pdf,.jpg,.png"
            file={formData.idDocumentFile}
            previewUrl={filePreviews.idDocumentFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'idDocumentFile')} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OwnerKycSection;
