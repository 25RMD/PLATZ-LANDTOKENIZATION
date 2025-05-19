// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PlatzLandNFT.sol";

contract LandMarketplace is ERC721Holder, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Marketplace fee in basis points (e.g., 250 = 2.5%)
    uint256 public marketplaceFeeInBps;
    PlatzLandNFT public immutable nftContract;

    Counters.Counter private _listingIdCounter;

    // Listing status enum
    enum ListingStatus { Active, Sold, Cancelled }

    // Listing struct
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        address currency; // address(0) for native ETH
        bool isActive;
        mapping(address => uint256) bids; // bidder address => bid amount
        address[] bidders; // Array of all bidders
    }

    // Collection listing struct
    struct CollectionListing {
        uint256 collectionId;
        address seller;
        uint256 basePrice;
        address currency; // address(0) for native ETH
        bool isActive;
        mapping(uint256 => bool) tokenListings; // tokenId => whether it's individually listed
    }

    // Mapping listingId => Listing
    mapping(uint256 => Listing) private _listings;
    
    // Mapping collectionId => CollectionListing
    mapping(uint256 => CollectionListing) private _collectionListings;

    // Events
    event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price, address currency);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event ListingSold(uint256 indexed listingId, uint256 indexed tokenId, address seller, address indexed buyer, uint256 price);
    event ListingPriceUpdated(uint256 indexed listingId, uint256 indexed tokenId, uint256 newPrice);
    event BidPlaced(uint256 indexed listingId, uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event BidAccepted(uint256 indexed listingId, uint256 indexed tokenId, address seller, address indexed bidder, uint256 amount);
    event BidWithdrawn(uint256 indexed listingId, uint256 indexed tokenId, address indexed bidder);
    
    // Collection events
    event CollectionListed(uint256 indexed collectionId, address indexed seller, uint256 basePrice, address currency);
    event CollectionUnlisted(uint256 indexed collectionId, address indexed seller);
    event CollectionTokenSold(uint256 indexed collectionId, uint256 indexed tokenId, address seller, address indexed buyer, uint256 price);

    /**
     * @dev Constructor to set up the marketplace
     * @param _nftContract Address of the NFT contract
     * @param _marketplaceFeeInBps Marketplace fee in basis points (250 = 2.5%)
     */
    constructor(address _nftContract, uint256 _marketplaceFeeInBps) {
        require(_nftContract != address(0), "Invalid NFT contract address");
        require(_marketplaceFeeInBps <= 10000, "Fee cannot exceed 100%");
        
        nftContract = PlatzLandNFT(_nftContract);
        marketplaceFeeInBps = _marketplaceFeeInBps;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Creates a new listing for a single token
     * @param tokenId NFT token ID
     * @param price Listing price
     * @param currency Address of the ERC20 token or zero address for native ETH
     * @return listingId The ID of the new listing
     */
    function createListing(uint256 tokenId, uint256 price, address currency) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Transfer NFT to this contract
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Create listing
        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();
        
        Listing storage listing = _listings[listingId];
        listing.tokenId = tokenId;
        listing.seller = msg.sender;
        listing.price = price;
        listing.currency = currency;
        listing.isActive = true;
        
        emit ListingCreated(listingId, tokenId, msg.sender, price, currency);
        
        return listingId;
    }
    
    /**
     * @dev List a collection for sale
     * @param collectionId ID of the collection to list
     * @param basePrice Base price for tokens in the collection
     * @param currency Address of the ERC20 token or zero address for native ETH
     */
    function listCollection(uint256 collectionId, uint256 basePrice, address currency) external {
        require(basePrice > 0, "Base price must be greater than zero");
        
        // Get collection details
        (uint256 startTokenId, uint256 totalSupply, uint256 mainTokenId, , , address creator) = nftContract.getCollection(collectionId);
        
        // Verify ownership of main token
        require(nftContract.ownerOf(mainTokenId) == msg.sender, "Not collection owner");
        
        // Create collection listing
        CollectionListing storage collectionListing = _collectionListings[collectionId];
        collectionListing.collectionId = collectionId;
        collectionListing.seller = msg.sender;
        collectionListing.basePrice = basePrice;
        collectionListing.currency = currency;
        collectionListing.isActive = true;
        
        // The main token is automatically listed when the collection is listed
        // Transfer the main token to this contract
        nftContract.safeTransferFrom(msg.sender, address(this), mainTokenId);
        collectionListing.tokenListings[mainTokenId] = true;
        
        emit CollectionListed(collectionId, msg.sender, basePrice, currency);
    }
    
    /**
     * @dev Lists an individual token from a collection
     * @param collectionId ID of the collection
     * @param tokenId ID of the token to list
     */
    function listCollectionToken(uint256 collectionId, uint256 tokenId) external {
        CollectionListing storage collectionListing = _collectionListings[collectionId];
        require(collectionListing.isActive, "Collection not listed");
        require(collectionListing.seller == msg.sender, "Not collection seller");
        require(!collectionListing.tokenListings[tokenId], "Token already listed");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        
        // Check that the token belongs to the collection
        require(nftContract.getTokenCollection(tokenId) == collectionId, "Token not in collection");
        
        // Transfer the token to this contract
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);
        collectionListing.tokenListings[tokenId] = true;
    }
    
    /**
     * @dev Removes a collection listing
     * @param collectionId ID of the collection to unlist
     */
    function unlistCollection(uint256 collectionId) external {
        CollectionListing storage collectionListing = _collectionListings[collectionId];
        require(collectionListing.isActive, "Collection not listed");
        require(collectionListing.seller == msg.sender, "Not collection seller");
        
        // Get collection details
        (uint256 startTokenId, uint256 totalSupply, uint256 mainTokenId, , , ) = nftContract.getCollection(collectionId);
        
        // Return the main token to the seller
        nftContract.safeTransferFrom(address(this), msg.sender, mainTokenId);
        
        // Mark collection as inactive
        collectionListing.isActive = false;
        
        emit CollectionUnlisted(collectionId, msg.sender);
    }
    
    /**
     * @dev Buy a token from a collection
     * @param collectionId ID of the collection
     * @param tokenId ID of the token to buy
     */
    function buyCollectionToken(uint256 collectionId, uint256 tokenId) external payable nonReentrant {
        CollectionListing storage collectionListing = _collectionListings[collectionId];
        require(collectionListing.isActive, "Collection not listed");
        require(collectionListing.tokenListings[tokenId], "Token not listed");
        
        uint256 price = collectionListing.basePrice;
        address seller = collectionListing.seller;
        
        // Handle payment
        if (collectionListing.currency == address(0)) {
            // ETH payment
            require(msg.value >= price, "Insufficient payment");
            
            // Calculate fee
            uint256 fee = (price * marketplaceFeeInBps) / 10000;
            uint256 sellerAmount = price - fee;
            
            // Transfer payment to seller
            (bool success, ) = payable(seller).call{value: sellerAmount}("");
            require(success, "Failed to send ETH to seller");
            
            // Return excess ETH if any
            if (msg.value > price) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
                require(refundSuccess, "Failed to return excess ETH");
            }
        } else {
            // ERC20 payment would be implemented here
            revert("ERC20 payments not yet supported");
        }
        
        // Transfer token to buyer
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Update collection listing
        collectionListing.tokenListings[tokenId] = false;
        
        emit CollectionTokenSold(collectionId, tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Buy a listed NFT
     * @param listingId ID of the listing
     * @param buyer Address that will receive the NFT (can be different from msg.sender)
     */
    function buyListing(uint256 listingId, address buyer) external payable nonReentrant {
        require(buyer != address(0), "Invalid buyer address");
        
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        
        uint256 price = listing.price;
        
        if (listing.currency == address(0)) {
            // ETH payment
            require(msg.value >= price, "Insufficient payment");
            
            // Calculate fee
            uint256 fee = (price * marketplaceFeeInBps) / 10000;
            uint256 sellerAmount = price - fee;
            
            // Transfer payment to seller
            (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(success, "Failed to send ETH to seller");
            
            // Return excess ETH if any
            if (msg.value > price) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
                require(refundSuccess, "Failed to return excess ETH");
            }
        } else {
            // ERC20 payment would be implemented here
            revert("ERC20 payments not yet supported");
        }
        
        // Transfer NFT to buyer
        nftContract.safeTransferFrom(address(this), buyer, listing.tokenId);
        
        // Update listing
        listing.isActive = false;
        
        emit ListingSold(listingId, listing.tokenId, listing.seller, buyer, price);
    }
    
    /**
     * @dev Cancel a listing and return the NFT to the seller
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not seller or admin");
        
        // Return the NFT to the seller
        nftContract.safeTransferFrom(address(this), listing.seller, listing.tokenId);
        
        // Update listing
        listing.isActive = false;
        
        emit ListingCancelled(listingId, listing.tokenId, listing.seller);
    }
    
    /**
     * @dev Update the price of a listing
     * @param listingId ID of the listing
     * @param newPrice New price for the listing
     */
    function updateListingPrice(uint256 listingId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than zero");
        
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        listing.price = newPrice;
        
        emit ListingPriceUpdated(listingId, listing.tokenId, newPrice);
    }
    
    /**
     * @dev Place a bid on a listing
     * @param listingId ID of the listing
     */
    function placeBid(uint256 listingId) external payable nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.currency == address(0), "Only ETH bids supported");
        require(msg.value > 0, "Bid must be greater than zero");
        
        // If this is a new bidder, add them to the bidders array
        if (listing.bids[msg.sender] == 0) {
            listing.bidders.push(msg.sender);
        }
        
        // Update the bid amount
        listing.bids[msg.sender] = msg.value;
        
        emit BidPlaced(listingId, listing.tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev Accept a bid
     * @param listingId ID of the listing
     * @param bidder Address of the bidder whose bid to accept
     */
    function acceptBid(uint256 listingId, address bidder) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        require(listing.bids[bidder] > 0, "No bid from this bidder");
        
        uint256 bidAmount = listing.bids[bidder];
        
        // Calculate fee
        uint256 fee = (bidAmount * marketplaceFeeInBps) / 10000;
        uint256 sellerAmount = bidAmount - fee;
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Failed to send ETH to seller");
        
        // Transfer NFT to bidder
        nftContract.safeTransferFrom(address(this), bidder, listing.tokenId);
        
        // Update listing
        listing.isActive = false;
        
        emit BidAccepted(listingId, listing.tokenId, listing.seller, bidder, bidAmount);
        
        // Refund other bidders
        for (uint256 i = 0; i < listing.bidders.length; i++) {
            address currentBidder = listing.bidders[i];
            if (currentBidder != bidder && listing.bids[currentBidder] > 0) {
                uint256 refundAmount = listing.bids[currentBidder];
                listing.bids[currentBidder] = 0;
                
                (bool refundSuccess, ) = payable(currentBidder).call{value: refundAmount}("");
                require(refundSuccess, "Failed to refund bidder");
            }
        }
    }
    
    /**
     * @dev Withdraw a bid
     * @param listingId ID of the listing
     */
    function withdrawBid(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.bids[msg.sender] > 0, "No bid to withdraw");
        
        uint256 bidAmount = listing.bids[msg.sender];
        listing.bids[msg.sender] = 0;
        
        // Refund the bidder
        (bool success, ) = payable(msg.sender).call{value: bidAmount}("");
        require(success, "Failed to withdraw bid");
        
        emit BidWithdrawn(listingId, listing.tokenId, msg.sender);
    }
    
    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     * @return tokenId, seller, price, currency, isActive
     */
    function getListing(uint256 listingId) external view returns (
        uint256 tokenId,
        address seller,
        uint256 price,
        address currency,
        bool isActive
    ) {
        Listing storage listing = _listings[listingId];
        return (
            listing.tokenId,
            listing.seller,
            listing.price,
            listing.currency,
            listing.isActive
        );
    }
    
    /**
     * @dev Get collection listing details
     * @param collectionId ID of the collection
     * @return seller, basePrice, currency, isActive
     */
    function getCollectionListing(uint256 collectionId) external view returns (
        address seller,
        uint256 basePrice,
        address currency,
        bool isActive
    ) {
        CollectionListing storage listing = _collectionListings[collectionId];
        return (
            listing.seller,
            listing.basePrice,
            listing.currency,
            listing.isActive
        );
    }
    
    /**
     * @dev Check if a token in a collection is listed
     * @param collectionId ID of the collection
     * @param tokenId ID of the token
     * @return isListed Whether the token is listed
     */
    function isCollectionTokenListed(uint256 collectionId, uint256 tokenId) external view returns (bool) {
        return _collectionListings[collectionId].tokenListings[tokenId];
    }
    
    /**
     * @dev Get bid amount for a listing
     * @param listingId ID of the listing
     * @param bidder Address of the bidder
     * @return amount Bid amount
     */
    function getBidAmount(uint256 listingId, address bidder) external view returns (uint256) {
        return _listings[listingId].bids[bidder];
    }
    
    /**
     * @dev Get all bidders for a listing
     * @param listingId ID of the listing
     * @return bidders Array of bidder addresses
     */
    function getListingBidders(uint256 listingId) external view returns (address[] memory) {
        return _listings[listingId].bidders;
    }
    
    /**
     * @dev Mint a new collection directly through the marketplace
     * @param to Address that will receive the NFTs
     * @param mainTokenURI URI for the main token metadata
     * @param quantity Number of tokens to mint
     * @param collectionURI URI for the collection metadata
     * @param baseURI Base URI for additional tokens
     * @return collectionId ID of the created collection
     * @return mainTokenId ID of the main token in the collection
     */
    function mintCollection(
        address to,
        string memory mainTokenURI,
        uint256 quantity,
        string memory collectionURI,
        string memory baseURI
    ) external onlyRole(MINTER_ROLE) returns (uint256, uint256) {
        // Call the NFT contract to create a new collection
        return nftContract.createCollection(to, mainTokenURI, quantity, collectionURI, baseURI);
    }
    
    /**
     * @dev Mint a single NFT directly through the marketplace
     * @param to Address that will receive the NFT
     * @param uri URI for token metadata
     * @return tokenId ID of the minted token
     */
    function mintNFT(address to, string memory uri) external onlyRole(MINTER_ROLE) returns (uint256) {
        // Call the NFT contract to mint a new token
        return nftContract.safeMint(to, uri);
    }
    
    /**
     * @dev Update the marketplace fee
     * @param newFeeInBps New fee in basis points
     */
    function updateMarketplaceFee(uint256 newFeeInBps) external onlyRole(ADMIN_ROLE) {
        require(newFeeInBps <= 10000, "Fee cannot exceed 100%");
        marketplaceFeeInBps = newFeeInBps;
    }
    
    /**
     * @dev Withdraw accumulated fees
     * @param recipient Address to receive the fees
     */
    function withdrawFees(address recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(recipient).call{value: balance}("");
        require(success, "Failed to withdraw fees");
    }
    
    // Function to receive ETH
    receive() external payable {}
} 