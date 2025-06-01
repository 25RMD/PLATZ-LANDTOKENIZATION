import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import { FormDataInterface } from '../../types/createListing';

// Define the specific file field names used in this component
export type ChainOfTitleFileFieldNames = 
  | 'previousDeedFile'
  | 'titleReportFile'
  | 'titleInsuranceFile'
  | 'encumbranceHistoryFile'
  | 'titleOpinionFile';

interface ChainOfTitleProps {
  formData: FormDataInterface;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
      transition={{ delay: 1.2 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(315deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(135deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(315deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 16, repeat: Infinity }}
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
          6
        </motion.span>
        CHAIN-OF-TITLE & ENCUMBRANCE HISTORY
      </motion.h2>
      
      {/* Previous Deed and Title Reports */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="previousDeedFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            Previous Deed Documents
          </label>
          <FileInputField
            id="previousDeedFile"
            label=""
            accept=".pdf,.jpg,.jpeg,.png"
            file={formData.previousDeedFile}
            previewUrl={filePreviews.previousDeedFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'previousDeedFile')}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="titleReportFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            Title Report Upload
          </label>
          <FileInputField
            id="titleReportFile"
            label=""
            accept=".pdf,.doc,.docx"
            file={formData.titleReportFile}
            previewUrl={filePreviews.titleReportFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'titleReportFile')}
          />
        </motion.div>
      </motion.div>

      {/* Title Insurance Section */}
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
          TITLE INSURANCE
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="titleInsuranceFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Title Insurance Policy
            </label>
            <FileInputField
              id="titleInsuranceFile"
              label=""
              accept=".pdf,.doc,.docx"
              file={formData.titleInsuranceFile}
              previewUrl={filePreviews.titleInsuranceFile || null}
              onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'titleInsuranceFile')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="titleInsuranceCompany" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Insurance Company</label>
            <input
              type="text"
              id="titleInsuranceCompany"
              name="titleInsuranceCompany"
              value={formData.titleInsuranceCompany}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., First American Title Insurance"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="titleInsurancePolicyNumber" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Policy Number</label>
            <input
              type="text"
              id="titleInsurancePolicyNumber"
              name="titleInsurancePolicyNumber"
              value={formData.titleInsurancePolicyNumber}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., TI-2023-12345"
              disabled={isSubmitting}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Encumbrance History */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          ENCUMBRANCE HISTORY
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="encumbranceDetails" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Encumbrance Details</label>
            <textarea
              id="encumbranceDetails"
              name="encumbranceDetails"
              value={formData.encumbranceDetails}
              onChange={handleInputChange}
              rows={4}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="Describe any liens, easements, or other encumbrances"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="encumbranceHistoryFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Encumbrance History Documents
            </label>
            <FileInputField
              id="encumbranceHistoryFile"
              label=""
              accept=".pdf,.doc,.docx"
              file={formData.encumbranceHistoryFile}
              previewUrl={filePreviews.encumbranceHistoryFile || null}
              onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'encumbranceHistoryFile')}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Legal Opinion */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          LEGAL OPINION
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="titleOpinionFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
              Attorney Title Opinion
            </label>
            <FileInputField
              id="titleOpinionFile"
              label=""
              accept=".pdf,.doc,.docx"
              file={formData.titleOpinionFile}
              previewUrl={filePreviews.titleOpinionFile || null}
              onChange={handleFileChange}
              onDrop={(e) => handleDrop(e, 'titleOpinionFile')}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="attorneyOpinionProvider" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Attorney / Law Firm</label>
            <input
              type="text"
              id="attorneyOpinionProvider"
              name="attorneyOpinionProvider"
              value={formData.attorneyOpinionProvider}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., Smith & Associates Law Firm"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="md:col-span-2">
            <label htmlFor="recordedInstruments" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Recorded Instruments</label>
            <textarea
              id="recordedInstruments"
              name="recordedInstruments"
              value={formData.recordedInstruments}
              onChange={handleInputChange}
              rows={3}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="List any recorded instruments affecting the property"
              disabled={isSubmitting}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChainOfTitleSection;
