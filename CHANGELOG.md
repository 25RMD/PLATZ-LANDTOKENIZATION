### Changed
- **Restored Explore Functionality**: Reverted explore-related files to commit `41666528f90f81cc5d151570ad48ccce82eba634` to restore stable functionality.
  - Updated main explore pages: `app/explore/page.tsx` and `app/explore/[id]/page.tsx`
  - Restored main components: `mainpages/ExploreNFTPage.tsx` and `mainpages/NFTCollectionDetailPage.tsx`
  - Updated `components/CollectionCard.tsx` with proper navigation handling
  - Restored context providers: `context/AuthContext.tsx`, `context/CurrencyContext.tsx`, and `context/ExploreStateContext.tsx`
  - Updated API routes: `/api/collections/route.ts` and `/api/collections/[id]/stats/route.ts`
  - Restored utility: `lib/utils/currencyConversion.ts`



All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Comprehensive Explore Functionality Restoration**: Restored all explore and collection detail page functionality to stable state from commit `df66b8fe5a1ca52d6d6692d822719be5f80ba8d3`.
  - Reverted `app/explore/page.tsx`, `app/explore/[id]/page.tsx` to working versions with enhanced navigation
  - Restored `mainpages/ExploreNFTPage.tsx` and `mainpages/NFTCollectionDetailPage.tsx` with optimized data fetching logic
  - Reverted `components/CollectionCard.tsx` with improved UI and navigation handling
  - Restored `context/ExploreStateContext.tsx` for state management and `hooks/usePreservedNavigation.tsx` for navigation preservation
  - Restored `lib/ethereum/contractUtils.ts` with updated contract interaction utilities
  - Restored `context/AuthContext.tsx` and `context/CurrencyContext.tsx` for proper context management
  - Added `debug-collection-count.js` utility for debugging collection data
  - Ensured all explore-related functionality matches the stable commit architecture
- **Standardized Bids API Routes**: Systematically refactored all bids-related API endpoints (`/api/bids/*`) to align with project-wide conventions.
  - Converted all `camelCase` parameters, Prisma query fields, and JSON response keys to `snake_case` for consistency with the Prisma schema.
  - Replaced all local Prisma Client instances with the shared client from `@/lib/prisma` to ensure proper connection pooling and prevent resource exhaustion.
  - Removed all `prisma.$disconnect()` calls from API routes to avoid prematurely closing the shared database connection.
  - Affected routes include: `/api/bids`, `/api/bids/place`, `/api/bids/history`, `/api/bids/received`, `/api/bids/received/all-received`, `/api/bids/active`, `/api/bids/[bidId]/reject`, and `/api/bids/[bidId]/status`.

### Fixed
- **Admin Dashboard Visibility**: Corrected a `camelCase` vs. `snake_case` mismatch in the frontend `AuthContext`. The `User` interface and all related logic were updated to use `snake_case` properties (e.g., `is_admin`), ensuring the admin dashboard link now correctly appears for authenticated admin users.
- **KYC Request Admin API**: Resolved a 500 error on the `/api/admin/kyc-requests` endpoint by correcting Prisma query field names from `snake_case` to the required `camelCase` and aligning the JSON response with frontend expectations.
- **KYC Request Submission**: Fixed a bug in the `PUT /api/profile` endpoint where KYC update requests were not created correctly. The API now properly creates `kyc_update_requests` records with a `PENDING` status and returns data with `camelCase` keys to ensure consistency with the frontend.
- **Collection Detail Page Stability**: Fixed a `TypeError` on the NFT collection detail page that occurred when market statistics (e.g., `priceChange24h`) were missing from the fetched data. Added defensive checks to ensure all statistics are valid numbers before rendering, preventing the page from crashing and improving its robustness.
- **Hydration Mismatch Errors**: Fixed React hydration errors caused by server-client state mismatches
  - Added mounted checks in Header component to prevent authentication-dependent rendering during hydration
  - Updated AuthContext to start with consistent initial state (isLoading: false) between server and client
  - Ensured authentication state is only checked after component mount to prevent SSR/client inconsistencies
- **Prisma Model Access Errors**: Resolved runtime errors in API routes caused by incorrect Prisma client model accessor usage
  - Fixed `TypeError: Cannot read properties of undefined (reading 'findUnique')` in `/api/auth/me` route
  - Fixed `TypeError: Cannot read properties of undefined (reading 'findMany')` in `/api/collections` route
  - Added runtime aliases in `lib/prisma.ts` to map legacy camelCase model accessors (`prisma.landListing`, `prisma.user`) to correct snake_case accessors (`prisma.land_listings`, `prisma.users`)
  - Updated field names in API queries to use snake_case format matching Prisma schema (e.g., `collection_id`, `mint_status`, `kyc_verified`)
  - Regenerated Prisma client to ensure type compatibility with schema changes
- **Create Page Infinite Loading**: Fixed infinite loading issue on `/create` page when no user is logged in
  - Resolved dependency loop in AuthContext useEffect that prevented proper authentication state initialization
  - Fixed Prisma client delegate usage in `/api/auth/me` route (changed from `prisma.users` to `prisma.user`)
  - Updated field names in frontend collection data mapping to use snake_case format (e.g., `collection_id`, `nft_title`, `evm_address`)
  - Fixed BigInt conversion error in ExploreNFTPage component by ensuring proper field name mapping from API response

### Added
- **Trading and Item Management Features**:
  - **Bidding System**: Implemented comprehensive bidding functionality with smart contract integration
    - Created `BidModal` component for placing bids on individual NFTs
    - Added API endpoints (`/api/bids`) for bid creation and retrieval with automatic bid status management
    - Integrated real-time bid tracking with highest bid display and outbid notifications
    - Added bid buttons to collection detail pages with wallet authentication checks
  - **Batch Purchase Functionality**: Implemented multi-token purchase capabilities
    - Created `BatchPurchaseModal` component for selecting and purchasing multiple NFTs simultaneously
    - Added progress tracking and error handling for sequential blockchain transactions
    - Integrated batch purchase buttons on collection pages when tokens are available for sale
  - **Orders Page**: Implemented comprehensive user inventory management (`/orders`)
    - Added dual-tab interface (Collections vs Individual Tokens) for clear organization
    - Implemented real-time blockchain scanning for user-owned NFTs across all collections
    - Real marketplace integration: checks listing status and prices from smart contracts
    - Functional listing/unlisting capabilities with transaction handling and loading states
    - Status badges showing listing status and prices similar to bids page
    - Time formatting showing acquisition time ("2 hours ago")
    - Advanced filtering (all/listed/unlisted) with real status checking and sorting
    - Real-time search functionality across collections and tokens
    - Toast notifications for actions and error handling with retry mechanisms
    - Wallet connection requirements and authentication flow
    - Enhanced metadata display with management capabilities (list/unlist, view, Etherscan links)
  - **Real Price Statistics**: Replaced mock data with actual database-driven analytics
    - Enhanced `/api/collections/[collectionId]/stats` to query real transaction history
    - Added 24h volume, sales count, price change calculations based on `NftTransaction` table
    - Integrated floor price calculation from active listings and top bid tracking
    - Added price trend indicators (up/down arrows) on collection detail pages

- **RPC Configuration**: Enhanced RPC configuration with multiple fallback endpoints and improved error handling
- **Error Handling**: Added ErrorBoundary component to gracefully catch and display React errors
- **Upload Handling**: Implemented fallback upload handler for missing uploads
- **Rate Limiting**: Added rate limiting to API routes to prevent abuse

### Fixed
- Resolved critical database schema drift and migration history conflicts by manually creating a new baseline migration, restoring data from backup, and aligning the Prisma schema with the PostgreSQL database. This fixed the `ListingStatus` enum mismatch and stabilized the database for future development.
- Fixed a 500 server error on the `/api/land-listings` POST route caused by incorrect data parsing and schema mismatches. The data handling logic has been completely rewritten to ensure all form fields are safely parsed and align with the Prisma schema, preventing server crashes when creating new land listings.
- **Wallet Connection**: Implemented a `WalletConnectModal` to fix the non-functional "Connect Wallet" button in the header. The button now correctly prompts users to select from available wallet connectors, resolving previous `wagmi` hook errors.
- **Bid Button Logic**: Fixed inverted logic where "Place Bid" button was only visible when wallet was disconnected. Now correctly shows bid button when wallet is connected and user doesn't own the token, with a "Connect Wallet to Bid" message when disconnected.
- **RPC Connection**: Improved reliability of Ethereum RPC connections with better error handling and retry logic
- **Error Handling**: Added proper error boundaries and improved error messages throughout the application
- **Uploads**: Fixed 404 errors for missing uploads with a proper fallback handler
- Corrected destructuring of marketplace listing data in `NFTCollectionDetailPage.tsx` to align with the five values returned by the `getCollectionListing` smart contract function (seller, mainTokenId, price, paymentToken, isActive).
- Improved type safety for contract interactions by defining an `Address` type (`0x${string}`) in `config/contracts.ts` and ensuring all exported contract addresses and the `getContractAddress` function utilize this stricter type. This resolves lint errors related to address type mismatches in consuming components.
- Fixed individual token listing status check in `NFTCollectionDetailPage.tsx` by using the correct `getListing` smart contract function (instead of the non-existent `isCollectionTokenListed`) and correctly processing its object return type to access the `isActive` property.

### Changed
- Updated links on collection cards in the explore section to correctly navigate to their detail pages (`/explore/[id]`).
- Replaced all instances of `LoadingSpinner` with a new `PulsingDotsSpinner` component for a consistent loading animation across the application. Removed the old `LoadingSpinner` component files.
- Refactored `CollectionCard.tsx` to use `CollectionDetail` type directly, simplifying data flow and ensuring correct display of collection name, description, image, creator, and price.
- Updated `ExploreNFTPage.tsx` to consistently use `onChainCollections` (of type `CollectionDetail[]`) for state management and rendering, removing legacy `NFTCollection` transformations and resolving associated lint errors.

### Fixed
- Resolved TypeScript errors in `app/api/collections/[collectionId]/route.ts` by:
  - Correcting the Prisma relation name from `individualNfts` to `nfts` to match the schema.
  - Aligning the `price` field type in `ProcessedNft` interface to `number | null` to match Prisma's `Float` type.
  - Ensuring the `responseData` object uses the correct `nfts` key.
- Resolved various lint errors in `ExploreNFTPage.tsx` and `CollectionCard.tsx` related to incorrect type usage, missing imports, and obsolete variable references after refactoring collection data handling.
- Resolved lint errors by updating `tsconfig.json` to correctly alias the `@/context` path and by correcting prop usage for `ConfirmationModal` in the admin dashboard (changed `isOpen` to `open`, `onClose` to `onCancel`, and moved `title`/`message` to `children`).
- Removed redundant "Loading Collections..." text from `ExploreNFTPage.tsx` as `PulsingDotsSpinner` is already present.
- Fixed "Cannot find module '@/config/contracts'" error by adding the `@/config` path alias to `tsconfig.json`.
- Removed redundant "Loading profile data..." text from `app/profile/page.tsx`.
- Fixed lint error in `app/profile/page.tsx` by changing `isLoading` to `isPending` for the `useSignMessage` hook (wagmi API update).
- Investigated and confirmed that redundant loading text has been removed from key pages (`ExploreNFTPage`, `ProfilePage`). Other pages (`CollectionsPage`, `NFTCollectionDetailPage`, `MarketplacePage`, `WatchlistPage`, `MyListingsPage`, `app/collections/[collectionId]/page`) correctly use skeleton loaders or only the `PulsingDotsSpinner` for their loading states.
- Standardized `PulsingDotsSpinner` component usage across the application to default to `size={48}` and `color="bg-black dark:bg-white"` for general page loading states. Smaller sizes (e.g., `16`, `20`) are used for inline spinners within buttons or icons. Redundant loading text alongside spinners in `app/admin/dashboard/page.tsx` was also removed.

### Changed
- Updated the post-login loading indicator in `ProtectedRoute.tsx` to be more minimalistic:
  - Corrected `LoadingSpinner` size prop to use a numeric value (`48`) instead of a string (`"lg"`), fixing potential rendering issues.
  - Removed the "Checking authentication..." text for a cleaner UI.
- Refactored NFT metadata fetching on `ExploreNFTPage`:
  - Moved `fetchCollectionDetails` logic into `ExploreNFTPage` as a `useCallback` hook.
  - Created a new utility function `fetchAndProcessCollectionDetails` in `lib/collectionUtils.ts` to encapsulate the core fetching and processing logic, making it reusable.
  - Moved the `CollectionDetail` interface to a dedicated `lib/types.ts` file.
  - Updated `LoadingSpinner` component (`components/common/LoadingSpinner.tsx`) to accept a `size` prop and use `FiLoader` icon with a spinning animation.

### Fixed
- Fixed a JSX syntax error in `components/common/FileInputField.tsx` caused by a malformed block displaying selected file information. Replaced the faulty block with correct logic using the existing `fileNameDisplay` variable and added file size display for single files.
- Resolved TypeScript lint error "Property 'size' does not exist on type 'IntrinsicAttributes'" by updating `LoadingSpinner` to correctly accept and utilize the `size` prop.
- Resolved TypeScript lint error "Argument of type '(...ABI definition...)[]' is not assignable to parameter of type '0x${string}'" by correcting the argument order in the call to `fetchAndProcessCollectionDetails` in `ExploreNFTPage.tsx`.
- Resolved TypeScript lint error "Argument of type 'string' is not assignable to parameter of type '0x${string}'" by explicitly casting imported contract addresses to the `0x${string}` type at the call site in `ExploreNFTPage.tsx`.
- Resolved TypeScript lint error "Argument of type '(...ABI array...)' is not assignable to parameter of type 'Abi'. Type 'string' is not assignable to type '\"function\"'" by:
  - Applying `as const` assertions to ABI definitions in `contracts/PlatzLandNFTABI.ts` and `contracts/LandMarketplaceABI.ts`.
  - Importing the `Abi` type from `viem` and explicitly casting imported ABI objects to the `Abi` type at the call site in `ExploreNFTPage.tsx`.

### Fixed
- Fixed NFT collection images not displaying on ExploreNFTPage by implementing a two-tier workaround in `fetchCollectionDetails`:
  - Rewrites outdated ngrok URLs in the `collectionURI` (from the smart contract) to the current `NEXT_PUBLIC_BASE_URL` before fetching metadata.
  - After fetching metadata, if the `image` URL within the metadata is also an outdated ngrok URL, it's rewritten to the current `NEXT_PUBLIC_BASE_URL`.

- Resolved type mismatch errors in `app/api/nft/mint-collection/route.ts` during `LandListing` database updates after NFT collection minting. Ensured `collectionId` and `mainTokenId` (which are strings) are correctly assigned to Prisma model fields (defined as `String?`). Applied explicit `{ set: ... }` syntax for these and other string fields to satisfy TypeScript's type checking and improve robustness. Added checks for missing IDs post-mint event parsing.
- **Next.js 15 Compatibility:**
  - Updated dynamic API route handlers (`/api/static/collections/[landListingDbId]/child-tokens/[evmTokenId]/route.ts` and `/api/static/[...path]/route.ts`) to correctly `await` and process `params` objects, resolving runtime errors related to asynchronous parameter handling introduced in Next.js 15+.
- **Enhanced NFT Minting Reliability:**
  - Significantly improved RPC connection handling with:
    - Advanced connection caching to reuse successful connections
    - Prioritized RPC endpoints with tiered retry strategies
    - Exponential backoff for failed connection attempts
    - Increased timeouts and retry counts for more reliable connections
    - Better error handling and detailed logging for debugging
    - Optimized provider configurations for both ethers.js and Viem
  - Added robust event parsing logic to handle different transaction receipt formats
  - Implemented graceful error recovery for blockchain interactions
  - Fixed database update logic to correctly record minting status and transaction details
  - Added detailed logging throughout the minting process for better debugging
  - Added Viem client integration as a fallback for ethers.js connections
  - Added ability to remint NFTs for already minted land listings in development mode
- **Improved My Listings Page Functionality:**
  - Enhanced authentication handling with fallback mechanisms for development
  - Improved error handling and user feedback during NFT minting process
  - Added more robust data fetching with better error recovery
  - Implemented selective refresh after minting instead of full page reload
  - Added automatic clearing of error messages after a timeout period
  - Improved user experience with more descriptive status messages
- Fixed NFT minting functionality in the land listings API route by:
  - Corrected field names to match the Prisma schema (replaced `mintAddress` with `contractAddress` and `onChainOwnerPublicKey` with `evmOwnerAddress`)
  - Improved error handling for cases where users don't have an Ethereum address
  - Added proper validation for form submission and file handling
  - Fixed user relation handling to ensure a valid user is always connected to new land listings
  - Implemented automatic test user creation when needed for development purposes
- Enhanced NFT minting endpoint (`/api/nft/mint`) to improve development workflow:
  - Added flexible authentication handling that works with various auth methods
  - Allowed minting for land listings in DRAFT status (in addition to ACTIVE)
  - Removed strict user ownership validation during development
  - Added comprehensive logging for better debugging

### Added
- **My Listings Feature:**
  - Created My Listings page (`/app/my-listings/page.tsx`) to display all user's land listings
  - Implemented API endpoint for fetching user's land listings:
    - `GET /api/my-listings` - Fetch all land listings for the authenticated user
  - Added ability to view listing details, edit draft listings, and complete NFT minting
  - Added "My Listings" option to the account dropdown menu in the header
  - Implemented proper authentication checks to ensure only authorized users can access their listings
  - Enhanced user experience by providing clear status indicators for listing and minting status

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
- Collection statistics (`topOffer`, `volume24h`, `sales24h`) to the Land Listing page.
- Backend API (`/api/collections/[collectionId]`) now calculates and returns these statistics based on associated NFTs.
- Frontend display for new statistics in the stats bar on the collection page.
- Created `POST /api/profile/evm/challenge` endpoint to generate a nonce for linking an EVM wallet to an authenticated user's profile.
- Created `POST /api/profile/evm/link-wallet` endpoint to verify a signature and link an EVM wallet to an authenticated user's profile.
- Implemented EVM wallet linking and unlinking functionality on the frontend profile page (`app/profile/page.tsx`):
    - Updated "Link EVM Wallet" flow to use `POST /api/profile/evm/challenge` and `POST /api/profile/evm/link-wallet`.
    - Added "Unlink EVM Wallet" functionality, calling `PUT /api/profile` with `evmAddress: null`.
    - Added conditional UI elements for linking/unlinking based on wallet connection and linked status.

### Fixed
- **Completed Migration from Solana to Ethereum Sepolia:**
  - Updated `solana-utils.ts` to provide Ethereum-compatible placeholder functions for NFT minting
  - Changed default price currency from "SOL" to "ETH" in the CreateLandListingPage and NftDetailsSection components
  - Updated land-listings API route to use Ethereum addresses instead of Solana public keys
  - Removed unnecessary Solana dependencies and imports across the codebase
  - Implemented proper Ethereum address validation for NFT ownership

- **Resolved Solana Wallet Adapter Compatibility Issues:**
  - Fixed `transactRemote` export error from `@solana-mobile/mobile-wallet-adapter-protocol` by implementing a comprehensive solution:
    - Created a custom wallet configuration in `lib/wallet-config.ts` that explicitly excludes problematic mobile wallet adapters
    - Enhanced the custom wallet button component with better UX, error handling, and wallet selection dropdown
    - Added webpack configuration in `next.config.js` to exclude and provide fallbacks for problematic mobile wallet adapter packages
    - Improved error handling and user feedback for wallet connection/disconnection operations
  - This solution maintains all web wallet functionality while avoiding the dependency conflicts with mobile wallet adapters
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
- Fixed 500 error in the collections page by:
  - Updated middleware to allow public access to GET requests for the `/api/collections` endpoint while maintaining authentication for POST/PUT/DELETE requests
  - Enhanced error handling in the collections API route to properly handle Decimal type serialization
  - Added proper data processing to ensure consistent JSON response format
- Fixed currency display spacing in Volume (24h) and Floor Price sections by adding proper spacing between currency symbol and value
- Fixed collection images not displaying on the main collections page by updating the image URL handling in CollectionCard, CollectionListCard, and individual collection page components to properly use the /api/files/ endpoint
- Fixed horizontal overflow on the individual collection page by adding overflow control to container elements
- Fixed watchlist button functionality by implementing proper API integration with status checking and toggle functionality
- Fixed images not loading properly on the watchlist page by updating it to use the centralized imageUtils utility
- Potential lint errors related to incorrect field access in the frontend after API and schema updates.
- Resolved `WalletNotSelectedError` on the profile page when clicking 'Link Solana Wallet' by:
  - Modifying `handleLinkWallet` in `app/profile/page.tsx` to check for an existing `publicKey` from `useWallet` instead of attempting to call `connect()` directly.
  - Guiding the user to connect their wallet via the header button if no wallet is currently connected.
  - Disabling the 'Link Solana Wallet' button if no `publicKey` is available.
- Corrected Prisma client output path in `schema.prisma`.
- Removed `solanaPubKey` from the user profile API GET request in `app/api/profile/route.ts` as it's not a field in the `User` model.
- Resolved Prisma type errors after dependency updates and Prisma client regeneration.

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

### Changed
- **EVM Wallet Integration (Frontend Refactor):**
  - Replaced Solana wallet dependencies (`@solana/wallet-adapter-react`, `bs58`) with Wagmi and ethers.js for EVM compatibility.
  - Updated `app/layout.tsx` to include `WagmiProvider`.
  - Refactored `AuthContext.tsx`:
    - `User` interface now uses `evmAddress` instead of `solanaPubKey`.
    - Wallet connection, disconnection, and message signing logic updated for EVM wallets using Wagmi hooks.
    - Introduced `connectAndLoginEvmWallet` function, anticipating new backend endpoints (`/api/auth/evm/challenge`, `/api/auth/evm/login`).
  - Updated `components/common/Header.tsx` to display EVM wallet connection status and address.
  - Refactored `app/profile/page.tsx`:
    - Displays user's `evmAddress`.
    - Implemented EVM wallet linking functionality (signing a challenge, anticipating backend API update for `/api/profile/link-wallet` and `/api/profile/challenge`).
    - Profile update forms now handle `evmAddress`.
    - Resolved Zod validation error display issue.
  - Updated `prisma/schema.prisma`:
    - `User` model: Removed `solanaPubKey` and its index, added `evmAddress` (String, unique, VarChar(42)) and its index.
    - Regenerated Prisma Client and synchronized the database schema.
- Updated `PUT /api/profile` endpoint to allow unlinking of `evmAddress` (by setting it to null) and prevent direct linking/changing of `evmAddress` through this endpoint.
- Fixed distinct owner count calculation in API.
- Changed currency display unit from ETH to SOL on collection page.
- Changed currency display unit from ETH to SOL on individual NFT cards.
- Implemented local image upload for Property creation and saved correct URL.
- Changed currency display unit from ETH to SOL on main collections listing page (grid and list views).
- Refactored collection fetching logic to use a dedicated API route.
- Improved error handling and loading states on the collection detail page.
- Redesigned the collection detail page header ([collectionId]/page.tsx) to resemble the OpenSea layout, featuring a banner image, overlapping logo, collection info, and a dedicated stats bar.
- Updated the loading skeleton for the collection page header to match the new design.
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
- **Backend API (`app/api/collections/[collectionId]/route.ts`):**
  - Now fetches `individualNfts` (previously `nfts`) to calculate stats.
  - Response structure updated to include a `stats` object and `derivedItemsCount`, `derivedListedCount`, `derivedOwnerCount`.
- **Prisma Schema (`prisma/schema.prisma`):**
  - Corrected `LandListing` relation to `individualNfts NFT[] @relation("LandListingToNFTs")`.
- **Frontend (`app/collections/[collectionId]/page.tsx`):**
  - Renamed `LandListingWithDetails` interface to `LandListingWithCollectionStats` and updated its structure.
  - Stats bar now displays 7 items: Price, Top Offer, Volume (24h), Sales (24h), Items, Listed, Owners.
  - Loading skeleton for stats bar updated.
  - Corrected usage of Prisma mapped field names (e.g., `propertyAreaSqm`).
  - Removed usage of `propertyAddress` and `propertyType` (not in schema).
  - Ensured proper parsing of `Decimal` values (received as strings) before formatting.
- Unified Prisma versions in `package.json` (`prisma` and `@prisma/client` to `^6.7.0`).

### Changed
- Fixed NFT collections API (`/api/nft/collections` and `/api/nft/collections/[id]`):
  - Resolved `TypeError: Do not know how to serialize a BigInt` (often caused by `Decimal` types) in the collections list endpoint by ensuring `listingPrice` (Decimal) is converted to `number`.
  - Corrected `getCollectionById` to query by CUID (`id`) instead of attempting to convert CUID to `BigInt` for `collectionId`, fixing `SyntaxError: Cannot convert <CUID> to a BigInt`.
  - Ensured `listingPrice` and `listingPriceEth` (Decimal) are converted to `number` in `getCollectionById`.
  - Addressed TypeScript type inference issues for selected relations and Decimal conversions using type assertions.

### Added
- Created new API endpoint (`/api/images/[imageRef]`) to serve NFT images from the uploads directory.
- Added diagnostic scripts to verify database image references and fix incorrect values.

### Fixed
- Resolved issue with NFT images not displaying on the `/explore` page by updating database records using placeholder values.
- Fixed individual collection page loading at `/explore/[id]` by correcting the query parameter handling.
- Implemented proper error handling for missing images and incorrect database references.

### Removed
- Direct form field rendering from `CreateLandListingPage.tsx` (moved to section components).
- Obsolete `NFTCardSimple` rendering logic for multiple NFTs on the single collection page.
- Mock NFT data generation in `app/api/collections/[collectionId]/route.ts`.

## [Unreleased]

### Changed
- **Comprehensive Explore Functionality Restoration**: Restored all explore and collection detail page functionality to stable state from commit `62391592e7b53e99884d1f61694ecf2d5f780fc5`.
  - Reverted `app/explore/page.tsx`, `app/explore/[id]/page.tsx`, and `app/explore-simple/page.tsx` to working versions
  - Restored `mainpages/ExploreNFTPage.tsx` and `mainpages/NFTCollectionDetailPage.tsx` with stable data fetching logic
  - Reverted `components/CollectionCard.tsx` to use proper Next.js Link navigation instead of programmatic navigation
  - Restored `app/api/collections/route.ts` and `app/api/collections/user-owned/route.ts` with correct API logic
  - Restored `lib/collectionUtils.ts` and skeleton components for consistent UI behavior
  - Removed unnecessary API routes that were not part of the stable architecture

## [0.2.0] - YYYY-MM-DD

### Added
- Integrated Solana NFT minting logic into land listing creation.
- `mintAddress` and `metadataUri` fields added to `LandListing` model and API.
- Frontend display for single NFT (LandListing) details.
- Entry for frontend type fixes in SingleCollectionPage.

### Changed
- Refactored `app/api/collections/[collectionId]/route.ts` to return a single minted `LandListing`.
- Updated `app/collections/[collectionId]/page.tsx` to display single NFT details, removing collection-centric logic and mock data.
- Corrected type handling for Prisma `Decimal` (e.g., `listingPrice`, `площадьУчастка`) and `DateTime` (`createdAt`) fields in `app/collections/[collectionId]/page.tsx` to ensure proper formatting and prevent runtime/lint errors.

### Fixed
- Resolved various lint errors in `SingleCollectionPage` related to outdated field names and incorrect data types after API and interface changes.

### Removed
- Obsolete `NFTCardSimple` rendering logic for multiple NFTs on the single collection page.
- Mock NFT data generation in `app/api/collections/[collectionId]/route.ts`.

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup.
- Basic Next.js structure.
- Prisma schema definition (placeholder).

### Changed
- **ProtectedRoute Cyber Theme UI**: Updated authentication prompt to match project's minimalistic cyber aesthetic
  - Replaced generic authentication UI with cyber-themed design using project's color scheme
  - Added animated background effects with subtle cyber grid patterns and ambient gradients
  - Implemented minimalistic lock icon with cyber-style border and rounded corners
  - Updated typography to use `font-mono` with uppercase tracking for cyberpunk feel
  - Changed button text to cyber-style: "AUTHENTICATE" and "RETURN_HOME"
  - Added smooth motion animations with staggered entrance effects
  - Integrated glassmorphism with `backdrop-blur-cyber` and project's border radius system
  - Maintained black/white color scheme with subtle opacity variations for depth

### Fixed
- **Collections API Routes**: Fixed critical Prisma field name mismatches in `/api/collections/route.ts` and `/api/collections/user-owned/route.ts` that were causing `PrismaClientValidationError` at runtime.
  - Corrected field names from `camelCase` to `snake_case` to match the Prisma schema (e.g., `user_id` → `userId`, `collection_id` → `collection_id`)
  - Fixed Prisma model relationship names (e.g., `user` → `users` for the relationship field)
  - Updated user-owned collections logic to use database collection size instead of complex blockchain queries for better performance
  - Ensured proper error handling and fallback logic for blockchain contract interactions
- **Admin Dashboard Visibility**: Corrected a `camelCase` vs. `snake_case` mismatch in the frontend `AuthContext`. The `User` interface and all related logic were updated to use `snake_case` properties (e.g., `is_admin`), ensuring the admin dashboard link now correctly appears for authenticated admin users.
