"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/common/AnimatedButton";
import { FaChevronDown } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";
import FileInputField from '@/components/common/FileInputField';
import LegalDocumentsSection from '@/components/create-listing/LegalDocumentsSection';
import RegistryParcelSection from '@/components/create-listing/RegistryParcelSection';
import GeospatialSection from '@/components/create-listing/GeospatialSection';
import OwnerKycSection from '@/components/create-listing/OwnerKycSection';
import ChainOfTitleSection from '@/components/create-listing/ChainOfTitleSection';
import AdditionalInfoSection from '@/components/create-listing/AdditionalInfoSection';
import NftDetailsSection from '@/components/create-listing/NftDetailsSection';
import NftMintingSection from '@/components/nft/NftMintingSection'; 

// Import types from the child component
import { type LegalDocumentsFormData, type LegalDocumentsFileFieldNames } from '@/components/create-listing/LegalDocumentsSection';
import { type RegistryParcelFormData, type RegistryParcelFileFieldNames } from '@/components/create-listing/RegistryParcelSection';
import { type GeospatialFormData, type GeospatialFileFieldNames } from '@/components/create-listing/GeospatialSection';
import { type OwnerKycFormData, type OwnerKycFileFieldNames } from '@/components/create-listing/OwnerKycSection';
import { type ChainOfTitleFileFieldNames } from '@/components/create-listing/ChainOfTitleSection';
import { type AdditionalInfoFileFieldNames } from '@/components/create-listing/AdditionalInfoSection';

import { FormDataInterface } from '../types/createListing'; // Import FormDataInterface

// Define initial state for the new Land Listing form
const initialFormData: FormDataInterface = { // Explicitly type initialFormData
  // Core Legal Documents
  titleDeedFile: null as File | null,
  deedNumber: "",
  deedType: "", // Consider pre-defined options if applicable
  grantorName: "",
  granteeName: "", // Added Grantee based on common deed info
  deedDate: "",
  titleCertFile: null as File | null,
  certNumber: "",
  certIssueDate: "",
  certExpiryDate: "",
  encumbranceFile: null as File | null,
  encumbranceId: "",
  encumbrancePeriodStart: "",
  encumbrancePeriodEnd: "",
  // Registry & Parcel Identifiers
  parcelNumber: "",
  registryVolume: "",
  registryPage: "",
  surveyPlanFile: null as File | null,
  surveyPlanNumber: "",
  surveyDate: "",
  // Geospatial & Boundary Data
  country: "",
  state: "",
  localGovernmentArea: "",
  propertyAreaSqm: "",
  latitude: "",
  longitude: "",
  gisFile: null as File | null,
  // Owner Identity & KYC
  ownerName: "",
  ownerContact: "",
  ownerIdType: "",
  govIdNumber: "", // Renamed from ownerIdNumber
  idDocumentFile: null as File | null, // Renamed from ownerIdFile
  kycStatus: "pending", // Default KYC status
  // Chain-of-Title & Encumbrance History
  previousDeedFile: null as File | null,      
  titleReportFile: null as File | null,       
  titleInsuranceFile: null as File | null,    
  titleInsuranceCompany: "",      
  titleInsurancePolicyNumber: "", 
  encumbranceDetails: "",         
  encumbranceHistoryFile: null as File | null,
  titleOpinionFile: null as File | null, 
  attorneyOpinionProvider: "",    
  recordedInstruments: "",
  // On-Chain Metadata (Read-only/placeholder for now)
  docHash: "", // Will likely be generated server-side
  ipfsUri: "", // Will likely be generated server-side
  mintTimestamp: "", // Will likely be generated server-side
  tokenId: "", // Will likely be generated server-side
  // Additional Information
  propertyDescription: "",
  propertyPhotosFile: null as File[] | null,
  propertyValuation: "",
  propertyValuationFile: null as File | null,
  valuationDate: "",
  zoningClassification: "",
  zoningComplianceFile: null as File | null,
  // NFT Specific Details (NEW)
  nftTitle: "",
  nftDescription: "",
  nftImageFile: null as File | null,
  listingPrice: "",
  priceCurrency: "ETH",
  nftCollectionSize: 10, // Default, display as read-only
  additionalNotes: "", // Default additional notes
};

// Actual page component that handles rendering logic
const CreateListingContent = () => {
  const { isVerified } = useAuth(); // Get verification status

  // State for the form using the new initial state
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleDeedError, setTitleDeedError] = useState<string | null>(null);
  const [idDocumentError, setIdDocumentError] = useState<string | null>(null);
  const [savedListingId, setSavedListingId] = useState<string | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  // State for file previews (using a map for scalability)
  const [filePreviews, setFilePreviews] = useState<Record<string, string | string[]>>({});

  // Cyber-styled input field styles
  const inputFieldStyles = "w-full bg-white dark:bg-black text-black dark:text-white px-4 py-3 rounded-none border border-black/30 dark:border-white/30 focus:outline-none focus:border-black dark:focus:border-white transition-all duration-300 font-mono placeholder-black/50 dark:placeholder-white/50 shadow-sm hover:shadow-md";
  const inputFieldDisabledStyles = "w-full bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 px-4 py-3 rounded-none border border-black/20 dark:border-white/20 cursor-not-allowed font-mono";

  useEffect(() => {
    // This is the cleanup function that runs when the component unmounts
    return () => {
      Object.values(filePreviews).forEach(preview => {
        if (typeof preview === 'string') {
          URL.revokeObjectURL(preview);
        } else if (Array.isArray(preview)) {
          preview.forEach(URL.revokeObjectURL);
        }
      });
    };
  }, [filePreviews]); // Dependency array includes filePreviews to ensure cleanup targets the correct URLs

  // Generic handler for text, date, number, select inputs
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generic handler for file inputs
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = event.target;
    const files = event.target.files;

    // --- Revoke existing previews for this field --- 
    const currentPreview = filePreviews[name];
    if (currentPreview) {
      if (typeof currentPreview === 'string') {
        URL.revokeObjectURL(currentPreview);
      } else if (Array.isArray(currentPreview)) {
        currentPreview.forEach(URL.revokeObjectURL);
      }
    }
    // ----------------------------------------------

    if (files && files.length > 0) {
      if (name === 'propertyPhotosFile') { // Handle multiple files
        const fileArray = Array.from(files); // Convert FileList to File[]
        setFormData((prev) => ({ ...prev, [name]: fileArray }));
        // Create an array of preview URLs
        const newPreviews = fileArray.map((file: File) => URL.createObjectURL(file)); // Explicitly type file
        setFilePreviews((prev) => ({ ...prev, [name]: newPreviews }));
      } else if (name === 'nftImageFile') { // Handle single NFT image file
        const file = files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));
        // Create a single preview URL string
        const newPreviewUrl = URL.createObjectURL(file);
        setFilePreviews((prev) => ({ ...prev, [name]: newPreviewUrl }));
      } else { // Handle single files
        const file = files[0];
        setFormData((prev) => ({ ...prev, [name]: file }));
        // Create a single preview URL string
        const newPreviewUrl = URL.createObjectURL(file);
        setFilePreviews((prev) => ({ ...prev, [name]: newPreviewUrl }));
      }
    } else {
      // Handle file removal
      setFormData((prev) => ({ ...prev, [name]: null }));
      setFilePreviews((prev) => {
        const newState = { ...prev };
        delete newState[name]; // Existing previews already revoked above
        return newState;
      });
    }
    // Clear the input value to allow re-selecting the same file(s)
    event.target.value = '';
  };

   // Generic drop handler
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, fieldName: keyof FormDataInterface) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    // --- Revoke existing previews for this field --- 
    const currentPreview = filePreviews[fieldName];
    if (currentPreview) {
      if (typeof currentPreview === 'string') {
        URL.revokeObjectURL(currentPreview);
      } else if (Array.isArray(currentPreview)) {
        currentPreview.forEach(URL.revokeObjectURL);
      }
    }
    // ----------------------------------------------

    if (files && files.length > 0) {
       if (fieldName === 'propertyPhotosFile') { // Handle multiple files drop
         const fileArray = Array.from(files); // Convert FileList to File[]
         setFormData((prev) => ({ ...prev, [fieldName]: fileArray }));
         // Create an array of preview URLs
         const newPreviews = fileArray.map((file: File) => URL.createObjectURL(file)); // Explicitly type file
         setFilePreviews((prev) => ({ ...prev, [fieldName]: newPreviews }));
       } else if (fieldName === 'nftImageFile') { // Handle single NFT image file drop
         const file = files[0]; 
         setFormData((prev) => ({ ...prev, [fieldName]: file }));
         // Create a single preview URL string
         const newPreviewUrl = URL.createObjectURL(file);
         setFilePreviews((prev) => ({ ...prev, [fieldName]: newPreviewUrl }));
       } else { // Handle single file drop
         const file = files[0]; 
         setFormData((prev) => ({ ...prev, [fieldName]: file }));
         // Create a single preview URL string
         const newPreviewUrl = URL.createObjectURL(file);
         setFilePreviews((prev) => ({ ...prev, [fieldName]: newPreviewUrl }));
       }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setTitleDeedError(null);
    setIdDocumentError(null);

    // --- Manual Validation for Required Fields (Development: Only NFT fields are critical) ---
    let isValid = true;
    


    // Add checks for essential NFT fields
    if (!formData.nftTitle) {
      setError("NFT Title is required."); // Use general error for now, or create specific state
      isValid = false;
    }

    if (!formData.nftImageFile) {
      setError("NFT Image is required."); // Use general error for now, or create specific state
      isValid = false;
    }

    if (!isValid) {
      setIsSubmitting(false);
      return; // Stop submission
    }
    // --- End of Manual Validation ---

    // Clear previous errors if any before new submission attempt
    setError(null);
    setTitleDeedError(null);
    setIdDocumentError(null);

    const dataToSubmit = new FormData();

    // Append all fields from formData to FormData object
    Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        
        // Check if it's the multi-file field
        if (key === 'propertyPhotosFile' && Array.isArray(value)) {
           value.forEach((file: File, index: number) => { // Type file and index
             // Use bracket notation for array fields, e.g., propertyPhotosFile[0], propertyPhotosFile[1]
             // The exact naming convention might depend on your backend API expectation.
             // Using a simple key like 'propertyPhotosFile' multiple times is also common.
             dataToSubmit.append(key, file, file.name); // Append each file with the same key
           });
        } else if (value instanceof File) { // Handle single files
            dataToSubmit.append(key, value, value.name);
        } else if (value !== null && value !== undefined) { // Handle non-file values
           // Skip read-only fields
            if (!['docHash', 'ipfsUri', 'mintTimestamp', 'tokenId'].includes(key)) {
                 dataToSubmit.append(key, String(value));
            }
        }
    });



    try {
      const response = await fetch('/api/land-listings', {
        method: 'POST',
        body: dataToSubmit,
        // Headers might not be needed if backend handles FormData correctly
        // headers: { 'Content-Type': 'multipart/form-data' }, // Usually set automatically by browser for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response." }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newListing = await response.json(); // Assuming API returns the created listing
      
      // Set the saved listing ID to enable NFT minting
      setSavedListingId(newListing.id);
      setIsEditMode(true);
      
      alert(`Land Listing '${newListing.parcelNumber || 'Unknown Parcel'}' created successfully! You can now mint NFTs for this listing.`);
      
      // Don't reset the form in edit mode
      // Instead, scroll to the NFT minting section
      setTimeout(() => {
        const mintingSection = document.getElementById('nft-minting-section');
        if (mintingSection) {
          mintingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);

    } catch (error: any) {
      console.error("Error creating land listing:", error);
      alert(`Failed to create listing: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render verification warning if not verified
  if (!isVerified) {
    return (
      <motion.div 
        className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cyber background effects for verification warning */}
        <motion.div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 40%, rgba(0, 0, 0, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(0, 0, 0, 0.2) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="text-center bg-white dark:bg-black border-2 border-black/20 dark:border-white/20 p-12 max-w-md mx-auto relative">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8"
          >
            <FiAlertCircle className="text-black dark:text-white text-8xl mx-auto" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-mono uppercase tracking-wider text-black dark:text-white mb-6"
            style={{
              textShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            VERIFICATION REQUIRED
          </motion.h2>
          
          <motion.p 
            className="text-black/70 dark:text-white/70 mb-8 font-mono text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
          Please complete your profile and submit the required KYC information.
          </motion.p>
          
        <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatedButton className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-8 py-4 text-lg font-mono uppercase tracking-wider border border-black/30 dark:border-white/30">
                ACCESS PROFILE
          </AnimatedButton>
            </motion.div>
        </Link>
      </div>
      </motion.div>
    );
  }

  // Render the actual form if verified
  return (
    <motion.div 
      className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Cyber background pattern */}
      <motion.div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none z-0"
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Section with cyber styling */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono uppercase tracking-wider text-black dark:text-white mb-6"
            style={{
              textShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
            }}
            animate={{
              textShadow: [
                "0 0 30px rgba(0, 0, 0, 0.6)",
                "0 0 40px rgba(0, 0, 0, 0.8)",
                "0 0 30px rgba(0, 0, 0, 0.6)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            CREATE LAND LISTING
          </motion.h1>
          
          <motion.div 
            className="flex items-center justify-center space-x-4 text-black/70 dark:text-white/70 font-mono text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              BLOCKCHAIN TOKENIZATION
            </motion.span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 bg-black dark:bg-white rounded-full"
            />
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              SECURE & VERIFIED
            </motion.span>
          </motion.div>
          
          <motion.p 
            className="text-black/60 dark:text-white/60 max-w-3xl mx-auto font-mono text-base mt-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Complete the form below to tokenize your land property. All fields marked with an asterisk (*) are required for blockchain verification.
          </motion.p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-12 bg-white dark:bg-black border-2 border-black/20 dark:border-white/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Cyber form background effects */}
          <motion.div
            className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03] pointer-events-none"
            animate={{
              background: [
                "linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.1) 50%, transparent 51%)",
                "linear-gradient(135deg, transparent 49%, rgba(0,0,0,0.1) 50%, transparent 51%)",
                "linear-gradient(45deg, transparent 49%, rgba(0,0,0,0.1) 50%, transparent 51%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

        {/* === Core Legal Documents Section === */}
        <LegalDocumentsSection
             formData={formData as LegalDocumentsFormData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: LegalDocumentsFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* === Registry & Parcel Identifiers Section === */}
        <RegistryParcelSection
             formData={formData as RegistryParcelFormData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: RegistryParcelFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* === Geospatial & Boundary Data Section === */}
        <GeospatialSection
             formData={formData as GeospatialFormData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: GeospatialFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* === Owner Identity & KYC Section === */}
        <OwnerKycSection
             formData={formData as OwnerKycFormData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: OwnerKycFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
           isVerified={isVerified}
        />

        {/* === Additional Information Section === */}
        <AdditionalInfoSection
             formData={formData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: AdditionalInfoFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* === Chain-of-Title & Encumbrance History Section === */}
        <ChainOfTitleSection
             formData={formData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: ChainOfTitleFileFieldNames) => void}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* === NFT Details Section === */}
        <NftDetailsSection
             formData={formData}
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
             handleDrop={handleDrop}
           filePreviews={filePreviews}
             inputFieldStyles={inputFieldStyles}
             inputFieldDisabledStyles={inputFieldDisabledStyles}
           isSubmitting={isSubmitting}
        />

        {/* On-Chain Metadata Section */}
          <motion.div 
            className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <motion.h2 
              className="text-2xl font-mono uppercase tracking-wider text-black dark:text-white mb-8 flex items-center"
              whileHover={{ textShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
            >
              <motion.span 
                className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black mr-4 flex items-center justify-center text-lg font-bold font-mono border border-black/30 dark:border-white/30"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                8
              </motion.span>
              ON-CHAIN METADATA
            </motion.h2>
            <motion.p 
              className="text-black/60 dark:text-white/60 mb-8 font-mono text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              These fields will be automatically populated after the land listing is successfully created and minted on the blockchain.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="docHash" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Document Hashes</label>
              <input 
                type="text" 
                id="docHash" 
                name="docHash" 
                value={formData.docHash} 
                readOnly 
                disabled 
                  className={inputFieldDisabledStyles}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="ipfsUri" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">IPFS / Decentralized URI</label>
              <input 
                type="url" 
                id="ipfsUri" 
                name="ipfsUri" 
                value={formData.ipfsUri} 
                readOnly 
                disabled 
                placeholder="e.g., ipfs://..." 
                  className={inputFieldDisabledStyles}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="mintTimestamp" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Minting Timestamp</label>
              <input 
                type="datetime-local" 
                id="mintTimestamp" 
                name="mintTimestamp" 
                value={formData.mintTimestamp} 
                readOnly 
                disabled 
                  className={inputFieldDisabledStyles}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <label htmlFor="tokenId" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Token ID</label>
              <input 
                type="text" 
                id="tokenId" 
                name="tokenId" 
                value={formData.tokenId} 
                readOnly 
                disabled 
                  className={inputFieldDisabledStyles}
              />
              </motion.div>
            </div>
          </motion.div>
        
        {/* NFT Minting Section */}
        <div id="nft-minting-section">
          <NftMintingSection
            landListingId={savedListingId}
            formData={formData}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            inputFieldStyles={inputFieldStyles}
            inputFieldDisabledStyles={inputFieldDisabledStyles}
          />
        </div>

        {/* Submit Button */}
          <motion.div 
            className="px-12 py-8 bg-black/5 dark:bg-white/5 border-t-2 border-black/20 dark:border-white/20 flex justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <motion.div 
              className="text-sm text-black/60 dark:text-white/60 font-mono uppercase tracking-wider"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
            <span className="text-red-500">*</span> Required fields
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
          <AnimatedButton 
            type="submit" 
            disabled={isSubmitting} 
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-12 py-4 font-mono uppercase tracking-wider text-lg border border-black/30 dark:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {isSubmitting ? 'CREATING LISTING...' : 'CREATE LAND LISTING'}
          </AnimatedButton>
            </motion.div>
          </motion.div>
        </motion.form>
        </div>
    </motion.div>
  );
};

// Wrap the main content with ProtectedRoute
const CreateLandListingPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <CreateListingContent />
    </ProtectedRoute>
  );
};

// Define base input field style for reuse (add to your global CSS or Tailwind config if preferred)
const inputFieldStyles = "w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors";
const inputFieldDisabledStyles = "w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed";

// Minimal CSS-in-JS for base styles (better to integrate into global styles)
const styles = `
  .input-field {
    ${inputFieldStyles}
  }
  .input-field-disabled {
      ${inputFieldDisabledStyles}
  }
`;

// Inject styles (consider a better approach for production)
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


export default CreateLandListingPage;
