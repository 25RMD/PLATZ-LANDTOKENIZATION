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

// Import types from the child component
import { type LegalDocumentsFormData, type LegalDocumentsFileFieldNames } from '@/components/create-listing/LegalDocumentsSection';
import { type RegistryParcelFormData, type RegistryParcelFileFieldNames } from '@/components/create-listing/RegistryParcelSection';
import { type GeospatialFormData, type GeospatialFileFieldNames } from '@/components/create-listing/GeospatialSection';
import { type OwnerKycFormData, type OwnerKycFileFieldNames } from '@/components/create-listing/OwnerKycSection';
import { type ChainOfTitleFormData, type ChainOfTitleFileFieldNames } from '@/components/create-listing/ChainOfTitleSection';
import { type AdditionalInfoFormData, type AdditionalInfoFileFieldNames } from '@/components/create-listing/AdditionalInfoSection';

import { FormDataInterface } from '@/types/createListing'; // Import FormDataInterface

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
  priceCurrency: "SOL",
  nftCollectionSize: 100, // Default, display as read-only
  status: "DRAFT", // Default status
  additionalNotes: "", // Default additional notes
};

// Actual page component that handles rendering logic
const CreateListingContent = () => {
  const { isVerified } = useAuth(); // Get verification status

  // State for the form using the new initial state
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // State for file previews (using a map for scalability)
  const [filePreviews, setFilePreviews] = useState<Record<string, string | string[]>>({});

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
      // console.log("Revoked preview URLs on unmount"); // Optional: for debugging
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

    // --- Manual Validation for Required Files ---
    if (!formData.titleDeedFile) {
      alert('Please upload the Title Deed document.');
      setIsSubmitting(false);
      setError('Title Deed document is required.'); // Optional: Set error state
      return; // Stop submission
    }
    if (!formData.idDocumentFile) {
      alert('Please upload the ID Document Scan/Upload.');
      setIsSubmitting(false);
      setError('ID Document is required.'); // Optional: Set error state
      return; // Stop submission
    }
    // --- End Manual Validation ---

    const data = new FormData();

    // Append all fields from formData to FormData object
    Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        
        // Check if it's the multi-file field
        if (key === 'propertyPhotosFile' && Array.isArray(value)) {
           value.forEach((file: File, index: number) => { // Type file and index
             // Use bracket notation for array fields, e.g., propertyPhotosFile[0], propertyPhotosFile[1]
             // The exact naming convention might depend on your backend API expectation.
             // Using a simple key like 'propertyPhotosFile' multiple times is also common.
             data.append(key, file, file.name); // Append each file with the same key
           });
        } else if (value instanceof File) { // Handle single files
            data.append(key, value, value.name);
        } else if (value !== null && value !== undefined) { // Handle non-file values
           // Skip read-only fields
            if (!['docHash', 'ipfsUri', 'mintTimestamp', 'tokenId'].includes(key)) {
                 data.append(key, String(value));
            }
        }
    });

    // console.log("Submitting FormData:"); // For debugging
    // for (let pair of data.entries()) { // More detailed FormData logging
    //    console.log(pair[0]+ ', ', pair[1]); 
    // }

    try {
      // TODO: Update API endpoint for land listings
      const response = await fetch('/api/land-listings', { // <-- IMPORTANT: Use the correct endpoint
        method: 'POST',
        body: data,
        // Headers might not be needed if backend handles FormData correctly
        // headers: { 'Content-Type': 'multipart/form-data' }, // Usually set automatically by browser for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response." }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newListing = await response.json(); // Assuming API returns the created listing
      alert(`Land Listing '${newListing.parcelNumber || 'Unknown Parcel'}' created successfully!`); // Adjust success message

      // Reset form and previews
      setFormData(initialFormData);
      Object.values(filePreviews).forEach(preview => {
        if (typeof preview === 'string') {
          URL.revokeObjectURL(preview);
        } else if (Array.isArray(preview)) {
          preview.forEach(URL.revokeObjectURL);
        }
      });
      setFilePreviews({});

    } catch (error: any) {
      console.error("Error creating land listing:", error);
      alert(`Failed to create listing: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is authenticated but not verified, show a message
  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 border border-yellow-400 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
        <FiAlertCircle className="mx-auto h-12 w-12 text-yellow-500 dark:text-yellow-400 mb-4" />
        <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Verification Required</h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          You must be a verified user to create new land listings. {/* Updated text */}
          Please complete your profile and submit the required KYC information.
        </p>
        <Link href="/profile">
          <AnimatedButton className="bg-yellow-500 hover:bg-yellow-600 text-white dark:text-black dark:bg-yellow-400 dark:hover:bg-yellow-300">
            Go to Profile
          </AnimatedButton>
        </Link>
      </div>
    );
  }

  // Render the actual form if verified
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-3">Create New Land Listing</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Complete the form below to create a new land listing. All fields marked with an asterisk (*) are required.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">

        {/* === Core Legal Documents Section === */}
        <LegalDocumentsSection
           formData={formData as LegalDocumentsFormData} // Type assertion
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: LegalDocumentsFileFieldNames) => void} // Type assertion
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
        />

        {/* === Registry & Parcel Identifiers Section === */}
        <RegistryParcelSection
           formData={formData as RegistryParcelFormData} // Type assertion
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: RegistryParcelFileFieldNames) => void} // Type assertion
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
        />

        {/* === Geospatial & Boundary Data Section === */}
        <GeospatialSection
           formData={formData as GeospatialFormData} // Type assertion
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: GeospatialFileFieldNames) => void} // Type assertion
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
           // onOpenMapPicker={() => { /* TODO: Implement map modal */ }}
        />

        {/* === Owner Identity & KYC Section === */}
        <OwnerKycSection
           formData={formData as OwnerKycFormData} // Type assertion
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: OwnerKycFileFieldNames) => void} // Type assertion
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
           isVerified={isVerified}
        />

        {/* === Additional Information Section === */}
        <AdditionalInfoSection
           formData={formData} // REMOVE CAST: Pass formData directly
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: AdditionalInfoFileFieldNames) => void} // Keep cast if AdditionalInfoFileFieldNames is specific and needed
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
        />

        {/* === Chain-of-Title & Encumbrance History Section === */}
        <ChainOfTitleSection
           formData={formData} // REMOVE CAST: Pass formData directly
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop as (event: React.DragEvent<HTMLDivElement>, fieldName: ChainOfTitleFileFieldNames) => void} // Keep cast if ChainOfTitleFileFieldNames is specific and needed
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
        />

        {/* === NFT Details Section === */}
        <NftDetailsSection
           formData={formData} // REMOVE CAST: NftDetailsSection expects FormDataInterface compatible
           handleInputChange={handleInputChange}
           handleFileChange={handleFileChange}
           handleDrop={handleDrop} // REMOVE CAST: NftDetailsSection handleDrop expects (event, keyof FormDataInterface)
           filePreviews={filePreviews}
           inputFieldStyles="w-full bg-secondary-light dark:bg-zinc-800 text-text-light dark:text-text-dark px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border border-gray-300 dark:border-zinc-700 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
           inputFieldDisabledStyles="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed"
           isSubmitting={isSubmitting}
        />

        {/* On-Chain Metadata Section */}
        <div className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">8</span>
            On-Chain Metadata (Generated Post-Minting)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">These fields will be populated after the land listing is successfully created and minted on the blockchain.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="docHash" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Document Hashes</label>
              <input 
                type="text" 
                id="docHash" 
                name="docHash" 
                value={formData.docHash} 
                readOnly 
                disabled 
                className="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed" 
              />
            </div>
            <div>
              <label htmlFor="ipfsUri" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">IPFS / Decentralized URI</label>
              <input 
                type="url" 
                id="ipfsUri" 
                name="ipfsUri" 
                value={formData.ipfsUri} 
                readOnly 
                disabled 
                placeholder="e.g., ipfs://..." 
                className="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed" 
              />
            </div>
            <div>
              <label htmlFor="mintTimestamp" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Minting Timestamp</label>
              <input 
                type="datetime-local" 
                id="mintTimestamp" 
                name="mintTimestamp" 
                value={formData.mintTimestamp} 
                readOnly 
                disabled 
                className="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed" 
              />
            </div>
            <div>
              <label htmlFor="tokenId" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Token ID</label>
              <input 
                type="text" 
                id="tokenId" 
                name="tokenId" 
                value={formData.tokenId} 
                readOnly 
                disabled 
                className="w-full bg-gray-100 dark:bg-zinc-700/50 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </div>
          <AnimatedButton 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-8 py-3 rounded-md font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Listing...' : 'Create Land Listing'}
          </AnimatedButton>
        </div>
      </form>
    </div>
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
