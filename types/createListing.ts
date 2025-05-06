export interface FilePreview {
  name: string;
  url: string; // For image previews using Object.createObjectURL()
  type: string; // e.g., 'image/jpeg', 'application/pdf'
}

export interface FormDataInterface {
  // Core Legal Documents (from LegalDocumentsSection and initialFormData)
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

  // Registry & Parcel Identifiers (from RegistryParcelSection and initialFormData)
  parcelNumber: string;
  registryVolume: string;
  registryPage: string;
  surveyPlanFile: File | null;
  surveyPlanNumber: string;
  surveyDate: string;

  // Geospatial & Boundary Data (from GeospatialSection and initialFormData)
  latitude: string;
  longitude: string;
  gisFile: File | null;

  // Owner Identity & KYC (from OwnerKycSection and initialFormData)
  ownerName: string;
  ownerContact: string; // Added from initialFormData
  ownerIdType: string;  // Added from initialFormData
  govIdNumber: string;    // Renamed from ownerIdNumber
  idDocumentFile: File | null; // Renamed from ownerIdFile
  kycStatus: string; 

  // Chain-of-Title & Encumbrance History (from ChainOfTitleSection and initialFormData)
  previousDeedFile: File | null;       // From ChainOfTitleFormData
  titleReportFile: File | null;        // From ChainOfTitleFormData
  titleInsuranceFile: File | null;     // From ChainOfTitleFormData
  titleInsuranceCompany: string;       // From ChainOfTitleFormData
  titleInsurancePolicyNumber: string;  // From ChainOfTitleFormData
  encumbranceDetails: string;          // From ChainOfTitleFormData
  encumbranceHistoryFile: File | null; // From ChainOfTitleFormData
  titleOpinionFile: File | null;       // Present in both
  attorneyOpinionProvider: string;     // From ChainOfTitleFormData
  recordedInstruments: string;         // From initialFormData

  // On-Chain Metadata (from initialFormData - placeholders)
  docHash: string; 
  ipfsUri: string; 
  mintTimestamp: string; 
  tokenId: string; 

  // Additional Information (from AdditionalInfoSection and initialFormData)
  propertyDescription: string;
  propertyPhotosFile: File[] | null; // Array of files
  propertyValuation: string;
  propertyValuationFile: File | null;
  valuationDate: string;
  zoningClassification: string;
  zoningComplianceFile: File | null;

  // NFT Specific Details
  nftTitle: string;
  nftDescription: string;
  nftImageFile: File | null;
  listingPrice: string; 
  priceCurrency: string; 
  nftCollectionSize: number; 

  // Status & Additional Notes (from createListing.ts original + any general fields)
  status: 'DRAFT' | 'ACTIVE' | 'PENDING'; 
  additionalNotes?: string;
}
