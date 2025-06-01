import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';

// Define the specific file field names used in this component
export type OwnerKycFileFieldNames = 'idDocumentFile';

// Define the structure of the expected formData subset
export interface OwnerKycFormData {
  ownerName: string;
  ownerContact: string;
  ownerIdType: string;
  govIdNumber: string;
  idDocumentFile: File | null;
  kycStatus: string;
}

interface OwnerKycProps {
  formData: OwnerKycFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: OwnerKycFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
  isVerified: boolean;
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
  isVerified
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(180deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(0deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity }}
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
          4
        </motion.span>
        OWNER IDENTITY & KYC
      </motion.h2>
      
      {/* Verification Status Banner */}
      {isVerified && (
        <motion.div 
          className="mb-8 p-6 border border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <motion.p 
            className="text-green-800 dark:text-green-200 font-mono text-sm"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✓ ACCOUNT VERIFIED - KYC STATUS: APPROVED
          </motion.p>
        </motion.div>
      )}
      
      {/* Owner Information */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="ownerName" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Owner Full Name *</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., John Michael Smith"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="ownerContact" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Contact Information *</label>
          <input
            type="email"
            id="ownerContact"
            name="ownerContact"
            value={formData.ownerContact}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., owner@example.com"
            disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

      {/* Government ID Section */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          GOVERNMENT IDENTIFICATION
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="ownerIdType" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">ID Type *</label>
            <select
              id="ownerIdType"
              name="ownerIdType"
              value={formData.ownerIdType}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              disabled={isSubmitting}
            >
              <option value="">Select ID Type</option>
              <option value="passport">Passport</option>
              <option value="nationalId">National ID</option>
              <option value="driversLicense">Driver's License</option>
              <option value="stateId">State ID</option>
            </select>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="govIdNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Government ID Number *</label>
            <input
              type="text"
              id="govIdNumber"
              name="govIdNumber"
              value={formData.govIdNumber}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., A12345678"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="md:col-span-2">
            <label htmlFor="idDocumentFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Government ID Document Upload *
            </label>
            <FileInputField
              id="idDocumentFile"
              label=""
              accept=".pdf,.jpg,.jpeg,.png"
              file={formData.idDocumentFile}
              previewUrl={filePreviews.idDocumentFile || null}
              onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'idDocumentFile')}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OwnerKycSection;
