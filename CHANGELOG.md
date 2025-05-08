# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Watchlist Feature:**
  - Added `Watchlist` model to Prisma schema to track user's favorite collections
  - Created watchlist page (`/app/watchlist/page.tsx`) to display saved collections
  - Implemented API endpoints for watchlist management:
    - `GET /api/watchlist` - Fetch user's watchlist with collection details
    - `GET /api/watchlist/check` - Check if a collection is in user's watchlist
    - `POST /api/watchlist/toggle` - Add/remove collection from watchlist
  - Enhanced collection page with interactive favorite button that updates watchlist status
  - Added visual feedback for watchlist status (filled star icon when in watchlist)
  - Implemented proper authentication checks for all watchlist operations
  - Updated middleware to protect watchlist API routes and redirect unauthenticated users to login page when accessing the watchlist

### Fixed
- Fixed TypeScript linting errors in admin dashboard by removing invalid syntax characters and properly typing map function parameters.
- Added missing auth configuration file to bridge custom JWT authentication with NextAuth for admin API routes.
- Fixed authentication in admin API routes to properly use HTTP-only cookies instead of Authorization headers.
- Improved API response handling in dashboard to properly handle both array and object response formats.
- Fixed database schema issue with NFT-LandListing relationship by properly mapping the `landListingId` field to snake_case column name.
- Fixed NFT image display on collections page by implementing proper file storage and URL generation.
- Fixed authentication for watchlist API routes by updating middleware matcher configuration to include `/api/watchlist/:path*` and `/watchlist/:path*` routes.
- Fixed database query errors in watchlist API routes by updating raw SQL queries to use the correct column names:
  - Fixed `/api/watchlist/toggle` route to use `"userId"` and `"collectionId"` instead of `user_id` and `collection_id`
  - Fixed `/api/watchlist` main route to use proper snake_case column names (`nft_title`, `nft_description`, etc.) as defined by the `@map` annotations in the Prisma schema
  - Fixed `/api/watchlist/check` route to use the correct column name format
- Fixed horizontal overflow issue in collection page skeleton on large displays by removing problematic CSS classes
- Fixed currency display spacing in Volume (24h) and Floor Price sections by adding proper spacing between currency symbol and value
- Fixed collection images not displaying on the main collections page by updating the image URL handling in CollectionCard, CollectionListCard, and individual collection page components to properly use the /api/files/ endpoint
- Fixed horizontal overflow on the individual collection page by adding overflow control to container elements
- Fixed watchlist button functionality by implementing proper API integration with status checking and toggle functionality
- Fixed images not loading properly on the watchlist page by updating it to use the centralized imageUtils utility

### Enhanced
- **Location Data and Collection Information:**
  - Added location fields (country, state, local government area) for African countries in the land listing creation form
  - Added a required property area field (in square meters) to the Geospatial section of the land listing creation form
  - Enhanced the About section on collection pages to display comprehensive property information including location data and property dimensions
  - Implemented cascading dropdowns for location selection with data for multiple African countries
  - Implemented a backward-compatible solution to store location data and property area in additionalNotes until database migration is completed

- **Code Refactoring and Reusability:**
  - Created a reusable `useWatchlist` hook to centralize watchlist functionality across the application
  - Improved maintainability by extracting watchlist logic from individual components

- **Admin Dashboard Improvements:**
  - Added sub-tabs for Land Listing Management: 'Awaiting Review', 'Active Listings', and 'Archived (Rejected/Delisted)'
  - Implemented status-specific listing views with appropriate data fetching
  - Added expandable details sections for listings
  - Implemented listing status management with approve, reject, and delist functionality
  - Added confirmation modal for delisting active listings
  - Improved UI with status badges and action buttons
- **Code Architecture Improvements:**
  - Centralized image URL handling in a shared utility function for better maintainability and consistency
  - Enhanced image utility with UUID detection, content-specific placeholders, and debugging support
  - Implemented consistent image handling across all components with proper fallbacks
- **Collection Page Enhancements:**
  - Added URL copy functionality to the copy button with toast notification feedback
  - Implemented dropdown menu for the "more options" button with sharing options (Twitter, Email, Telegram)
  - Added blockchain explorer link in the dropdown menu when blockchain reference is available
  - Improved user experience with visual feedback and proper tooltips

### Added
- Initial setup
- Created CHANGELOG.md
- Added skeleton loaders for NFT card grids.
- Land Listing Creation Feature:
  - Renamed frontend component `mainpages/CreateNFTPage.tsx` to `mainpages/CreateLandListingPage.tsx`.
  - Added `LandListing` model to `prisma/schema.prisma` to store detailed listing data.
  - Created `POST /api/land-listings` endpoint to receive and save new land listing form data.
- Component sections for Create Land Listing form: LegalDocs, Registry/Parcel, Owner/KYC, Chain-of-Title, Additional Info.
- Reusable `FileInputField` component with drag-and-drop and preview.
- Specific TypeScript interfaces and types for each form section.
- Placeholder and guidance for custom JWT-based user authentication in the land listing creation API route (`app/api/land-listings/route.ts`).
- Added `additionalNotes` field to the `LandListing` Prisma schema.
- New fields to `FormDataInterface` for comprehensive chain-of-title and encumbrance history: `previousDeedFile`, `titleReportFile`, `titleInsuranceFile`, `titleInsuranceCompany`, `titleInsurancePolicyNumber`, `encumbranceDetails`, `encumbranceHistoryFile`, `titleOpinionFile`, `attorneyOpinionProvider`.
- `NftDetailsFileFieldNames` type in `NftDetailsSection.tsx`.

### Changed
- Fixed distinct owner count calculation in API.
- Changed currency display unit from ETH to SOL on collection page.
- Changed currency display unit from ETH to SOL on individual NFT cards.
- Implemented local image upload for Property creation and saved correct URL.
- Changed currency display unit from ETH to SOL on main collections listing page (grid and list views).
- Refactored collection fetching logic to use a dedicated API route.
- Improved error handling and loading states on the collection detail page.
- Redesigned the collection detail page header ([collectionId]/page.tsx) to resemble the OpenSea layout, featuring a banner image, overlapping logo, collection info, and a dedicated stats bar.
- Updated the loading skeleton for the collection page header to match the new design.
- Redesigned the Collection page header to closely match OpenSea's layout, including banner, logo, title, stats, and action buttons.
- Updated the loading skeleton for the Collection page header.
- Fixed collection page data fetching and rendering.
- Refactored `CreateLandListingPage.tsx` to use the new section components.
- Moved `useEffect` cleanup hook for file previews inside `CreateLandListingPage` component scope.
- Implemented multi-file upload capability for `propertyPhotosFile` field:
  - Updated `initialFormData` and `filePreviews` state in `CreateLandListingPage`.
  - Modified `handleFileChange`, `handleDrop`, and `handleSubmit` in `CreateLandListingPage` to handle `File[]`.
  - Added `multiple` prop and multi-preview support to `FileInputField`.
  - Added `disabled` prop to `FileInputField`.
  - Updated `filePreviews` prop type in all section components (`LegalDocumentsSection`, `RegistryParcelSection`, `AdditionalInfoSection`, `ChainOfTitleSection`, `OwnerKycSection`).
  - Passed `multiple` prop to `FileInputField` in `AdditionalInfoSection`.
- Corrected `FileList` handling in `CreateLandListingPage` handlers using `Array.from()`.
- Corrected `prismaData` field names (`ownerIdNumber`, `ownerIdFileRef`) in `app/api/land-listings/route.ts` to align with frontend form data, ensuring proper data mapping for `LandListing` creation.
- Commented out unused date and address proof fields in `prismaData` in `app/api/land-listings/route.ts` as they are not currently sent by the frontend.
- Reinstated `additionalNotes` in the `prismaData` object in `app/api/land-listings/route.ts` after it was added to the `LandListing` Prisma schema.
- **Type Safety & Consistency:**
    - Made several fields in `FormDataInterface` non-optional to align with `initialFormData`.
    - Renamed `ownerIdNumber` to `govIdNumber` and `ownerIdFile` to `idDocumentFile` in `FormDataInterface`, `CreateLandListingPage.tsx`, and `OwnerKycSection.tsx` for clarity.
    - Updated `handleDrop` function signature in `CreateLandListingPage.tsx` and consuming components (`NftDetailsSection`, `OwnerKycSection`, etc.) to use more specific `FileFieldNames` types (`keyof FormDataInterface` or component-specific file field name types) instead of generic `string`.
    - `AdditionalInfoFormData` in `AdditionalInfoSection.tsx`: `propertyPhotosFile` type changed from `File | null` to `File[] | null` to support multiple photo uploads.
    - `NftDetailsProps` in `NftDetailsSection.tsx`: `handleDrop` now uses `NftDetailsFileFieldNames`; `formData` prop is now more specific using `Pick<>`; `filePreviews` prop now uses `NftDetailsFileFieldNames`.
- **Component Updates:**
    - `CreateLandListingPage.tsx`: `initialFormData` updated to reflect all `FormDataInterface` changes.
    - `OwnerKycSection.tsx`: `OwnerKycFormData` and `OwnerKycFileFieldNames` updated to use `govIdNumber` and `idDocumentFile`.
    - `NftDetailsSection.tsx`: Corrected `FileInputField` import path and updated its props to align with the common component's API. Styling updated to match other sections.
- **API & Data Handling:**
    - Ensured `app/api/land-listings/route.ts` correctly processes new NFT-related fields (`nftTitle`, `nftDescription`, `nftImageFileRef`, `listingPrice`, `priceCurrency`) from `formData` when creating a `LandListing` record. `nftCollectionSize` relies on the schema default.
    - Ran `npx prisma generate` to update Prisma client after schema changes.
- Refactored `SingleCollectionPage` and `NFTCardSimple` to use `LandListingWithDetails` and handle new API data.
- Refactored `SingleCollectionPage.tsx` (`app/collections/[collectionId]/page.tsx`) to use the new `LandListingWithDetails` interface: updated data fetching, state management, and rendering logic for header, stats, 'About' section, and NFT grid to correctly display data from the updated API. Resolved TypeScript lint errors related to `category` and `volume` by adapting to the new model.
- Updated `NFTCardSimple.tsx` to accept and use a `collectionCurrency` prop for dynamic currency display in NFT prices, resolving a lint error from `SingleCollectionPage`.

### Fixed
- Ensured consistent data fetching and display for collection details.
- Resolved linting errors on the Collection page: removed redundant CSS classes and added missing icon imports.
- Resolved TypeScript errors related to component prop types after refactoring.
- Addressed potential memory leaks by ensuring file preview URLs are revoked on unmount and after submission.
- Corrected implicit 'any' types in `CreateLandListingPage` file handlers.
- Removed incorrect `getSession` (NextAuth.js specific) call from `app/api/land-listings/route.ts` which was causing a `ReferenceError` as the project uses custom authentication.
- Resolved `PrismaClientValidationError` in `app/api/land-listings/route.ts` by correctly mapping frontend form field names (e.g., `ownerIdNumber`, `ownerIdFileRef`) to their corresponding Prisma schema field names (`govIdNumber`, `idDocumentFileRef`) in the `prismaData` object. Ensured optional file reference fields are set to `null` instead of `undefined`.
- Resolved various TypeScript lint errors related to type mismatches in form data, props, and event handlers across `CreateLandListingPage.tsx`, `OwnerKycSection.tsx`, `AdditionalInfoSection.tsx`, and `NftDetailsSection.tsx`.
- Corrected import path errors in `NftDetailsSection.tsx`.
- Resolved Prisma client type error in `app/api/land-listings/route.ts` by regenerating the client, allowing `nftTitle` and other new fields to be recognized in `LandListingCreateInput`.
- Resolved `PrismaClientKnownRequestError` (P2025) in `app/api/land-listings/route.ts` POST handler by ensuring a connectable `userId` is available. This was temporarily addressed by updating the hardcoded `userId` to one present in the database, pending full authentication implementation.
- Corrected `PrismaClientValidationError` in `app/api/collections/route.ts` GET handler by removing the non-existent `slug` field from the `select` statement in the `prisma.landListing.findMany` query, allowing collections to be fetched successfully.

### Removed
- Direct form field rendering from `CreateLandListingPage.tsx` (moved to section components).

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup.
- Basic Next.js structure.
- Prisma schema definition (placeholder).
