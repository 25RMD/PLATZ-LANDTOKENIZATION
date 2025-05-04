# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial setup
- Created CHANGELOG.md
- Added skeleton loaders for NFT card grids.

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

### Fixed
- Ensured consistent data fetching and display for collection details.
- Resolved linting errors on the Collection page: removed redundant CSS classes and added missing icon imports.
