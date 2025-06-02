import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define the specific file field names used in this component
export type LegalDocumentsFileFieldNames =
  | 'titleDeedFile'
  | 'titleCertFile'
  | 'encumbranceFile';

// Define the structure of the expected formData subset and filePreviews subset
export interface LegalDocumentsFormData {
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
  formData: LegalDocumentsFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: LegalDocumentsFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
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
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(180deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity }}
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
          1
        </motion.span>
        CORE LEGAL DOCUMENTS
      </motion.h2>
      
      {/* --- Title Deed --- */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="titleDeedFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            Title Deed Upload *
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
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="deedNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Deed Number *</label>
          <input
            type="text"
            id="deedNumber"
            name="deedNumber"
            value={formData.deedNumber}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., TD12345678"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
           <label htmlFor="deedType" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Deed Type *</label>
           <input
            type="text"
            id="deedType"
            name="deedType"
            value={formData.deedType}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., Warranty Deed, Quitclaim Deed"
            disabled={isSubmitting}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="grantorName" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Grantor Name *</label>
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
        </motion.div>
         <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="granteeName" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Grantee Name *</label>
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
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="deedDate" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Date of Deed *</label>
          <input
            type="date"
            id="deedDate"
            name="deedDate"
            value={formData.deedDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

      {/* --- Title Certificate --- */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          TITLE CERTIFICATE
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
         <FileInputField
          id="titleCertFile"
          label="Title Certificate Document"
          accept=".pdf,.jpg,.jpeg,.png"
          file={formData.titleCertFile}
          previewUrl={filePreviews.titleCertFile || null}
          onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'titleCertFile')}
        />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="certNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Certificate Number</label>
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
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="certIssueDate" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Certificate Issue Date</label>
          <input
            type="date"
            id="certIssueDate"
            name="certIssueDate"
            value={formData.certIssueDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="certExpiryDate" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Certificate Expiry Date</label>
          <input
            type="date"
            id="certExpiryDate"
            name="certExpiryDate"
            value={formData.certExpiryDate}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
          </motion.div>
        </div>
      </motion.div>

       {/* --- Encumbrance Certificate --- */}
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
          ENCUMBRANCE CERTIFICATE
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
         <FileInputField
          id="encumbranceFile"
          label="Encumbrance Certificate Document"
          accept=".pdf,.jpg,.jpeg,.png"
          file={formData.encumbranceFile}
          previewUrl={filePreviews.encumbranceFile || null}
          onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'encumbranceFile')}
        />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="encumbranceId" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Encumbrance ID</label>
          <input
            type="text"
            id="encumbranceId"
            name="encumbranceId"
            value={formData.encumbranceId}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., EC2023456789"
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="encumbrancePeriodStart" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Period Start Date</label>
          <input
            type="date"
            id="encumbrancePeriodStart"
            name="encumbrancePeriodStart"
            value={formData.encumbrancePeriodStart}
            onChange={handleInputChange}
            className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} appearance-none`}
            disabled={isSubmitting}
          />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="encumbrancePeriodEnd" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Period End Date</label>
          <input
            type="date"
            id="encumbrancePeriodEnd"
            name="encumbrancePeriodEnd"
            value={formData.encumbrancePeriodEnd}
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

export default LegalDocumentsSection;
