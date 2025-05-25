// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Remove direct import of PlatzLandNFT.sol, use an interface instead for PlatzLandNFTWithCollections
// import "./PlatzLandNFT.sol"; 

// Interface for the PlatzLandNFTWithCollections contract
interface IPlatzLandNFTWithCollections is IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getCollection(uint256 collectionId) external view returns (
        uint256 startTokenId,
        uint256 totalSupply,
        uint256 mainTokenId,
        string memory baseURI,
        string memory collectionURI,
        address creator
    );
    function getTokenCollection(uint256 tokenId) external view returns (uint256);
    // Add other functions if needed by marketplace logic, e.g., isApprovedForAll
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function getApproved(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external; // for transferring the main token
}

/**
 * @title LandMarketplace
 * @dev A marketplace contract for trading Platz Land NFTs and Collections
 */
contract LandMarketplace is Ownable {
    // Marketplace fee percentage (in basis points, 100 = 1%)
    uint256 public marketplaceFee = 250; // 2.5% fee
    
    // Maximum marketplace fee (in basis points)
    uint256 public constant MAX_FEE = 1000; // 10%
    
    // Reentrancy guard
    bool private _notEntered = true;

    // Address of the PlatzLandNFTWithCollections contract
    IPlatzLandNFTWithCollections public platzNftContract;
    
    // Listing structure for individual NFTs
    struct Listing {
        address seller;
        uint256 price;
        address paymentToken; // address(0) for native ETH
        bool isActive;
    }
    
    // Bid structure for individual NFTs
    struct Bid {
        address bidder;
        uint256 amount;
        address paymentToken; // address(0) for native ETH
        uint256 timestamp;
    }

    // Collection Listing structure
    struct CollectionListing {
        address seller;         // Owner of the main token of the collection
        uint256 mainTokenId;    // The main token ID representing the collection
        uint256 price;          // Price for the entire collection (or its main representation)
        address paymentToken;   // Address(0) for native ETH
        bool isActive;
    }
    
    // Mapping from NFT contract address => tokenId => listing (for individual NFTs)
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // Mapping from NFT contract address => tokenId => highest bid (for individual NFTs)
    mapping(address => mapping(uint256 => Bid)) public highestBids;

    // Mapping from collectionId => CollectionListing
    // Assumes collectionId is unique across the linked platzNftContract
    mapping(uint256 => CollectionListing) public collectionListings;
    
    // Events
    event ListingCreated(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price, address paymentToken);
    event ListingUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId);
    event ListingPurchased(address indexed nftContract, uint256 indexed tokenId, address buyer, address seller, uint256 price);
    event BidPlaced(address indexed nftContract, uint256 indexed tokenId, address indexed bidder, uint256 bidAmount);
    event BidAccepted(address indexed nftContract, uint256 indexed tokenId, address bidder, address seller, uint256 bidAmount);
    event BidWithdrawn(address indexed nftContract, uint256 indexed tokenId, address indexed bidder);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);

    // New events for collections
    event CollectionListed(uint256 indexed collectionId, uint256 indexed mainTokenId, address indexed seller, uint256 price, address paymentToken);
    event CollectionListingUpdated(uint256 indexed collectionId, uint256 newPrice);
    event CollectionListingCancelled(uint256 indexed collectionId);
    event CollectionPurchased(uint256 indexed collectionId, uint256 indexed mainTokenId, address buyer, address seller, uint256 price);

    /**
     * @dev Constructor
     * @param initialOwner Address of the contract owner who receives marketplace fees
     * @param _platzNftContractAddress Address of the PlatzLandNFTWithCollections contract
     */
    constructor(address initialOwner, address _platzNftContractAddress) Ownable(initialOwner) {
        require(_platzNftContractAddress != address(0), "Marketplace: Invalid PlatzLandNFT contract address");
        platzNftContract = IPlatzLandNFTWithCollections(_platzNftContractAddress);
    }

    /**
     * @dev Sets or updates the PlatzLandNFTWithCollections contract address (onlyOwner)
     * @param _newNftContractAddress The new address of the PlatzLandNFTWithCollections contract
     */
    function setPlatzNftContractAddress(address _newNftContractAddress) external onlyOwner {
        require(_newNftContractAddress != address(0), "Marketplace: Invalid new PlatzLandNFT contract address");
        platzNftContract = IPlatzLandNFTWithCollections(_newNftContractAddress);
    }

    /**
     * @dev Create a listing for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Listing price
     * @param paymentToken Address of the payment token (use address(0) for ETH)
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external {
        require(price > 0, "Price must be greater than zero");
        
        // Check that caller is the owner of the NFT
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner of the NFT");
        
        // Check if NFT is approved for marketplace
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer NFT"
        );
        
        // Create the listing
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            paymentToken: paymentToken,
            isActive: true
        });
        
        emit ListingCreated(nftContract, tokenId, msg.sender, price, paymentToken);
    }
    
    /**
     * @dev Update listing price
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to update
     * @param newPrice New listing price
     */
    function updateListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        require(newPrice > 0, "Price must be greater than zero");
        
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.seller == msg.sender, "Not the listing seller");
        require(listing.isActive, "Listing not active");
        
        listing.price = newPrice;
        
        emit ListingUpdated(nftContract, tokenId, newPrice);
    }
    
    /**
     * @dev Cancel a listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.seller == msg.sender, "Not the listing seller");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        
        emit ListingCancelled(nftContract, tokenId);
    }
    
    /**
     * @dev Purchase a listed NFT with ETH
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to purchase
     */
    function purchaseListing(address nftContract, uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Listing not active");
        require(listing.paymentToken == address(0), "Listing not in ETH");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Execute purchase
        _executePurchase(nftContract, tokenId, msg.sender, listing.price);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }
    
    /**
     * @dev Place a bid on an NFT with ETH
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to bid on
     */
    function placeBid(address nftContract, uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "Bid amount must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) != msg.sender, "Cannot bid on your own NFT");
        
        Bid storage currentBid = highestBids[nftContract][tokenId];
        require(
            currentBid.bidder == address(0) || msg.value > currentBid.amount,
            "Bid amount must be higher than current bid"
        );
        
        // If there's an existing bid, refund the previous bidder
        if (currentBid.bidder != address(0)) {
            // Send the previous bid amount back to the previous bidder
            payable(currentBid.bidder).transfer(currentBid.amount);
        }
        
        // Set new highest bid
        highestBids[nftContract][tokenId] = Bid({
            bidder: msg.sender,
            amount: msg.value,
            paymentToken: address(0),
            timestamp: block.timestamp
        });
        
        emit BidPlaced(nftContract, tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev Accept the highest bid on an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to accept bid for
     */
    function acceptBid(address nftContract, uint256 tokenId) external nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner of the NFT");
        
        Bid storage highestBid = highestBids[nftContract][tokenId];
        require(highestBid.bidder != address(0), "No active bid");
        
        // Check if NFT is approved for marketplace
        require(
            nft.getApproved(tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer NFT"
        );
        
        // Get bid details for event
        address bidder = highestBid.bidder;
        uint256 bidAmount = highestBid.amount;
        
        // Calculate fee
        uint256 fee = (bidAmount * marketplaceFee) / 10000;
        uint256 sellerAmount = bidAmount - fee;
        
        // Transfer NFT to bidder
        nft.transferFrom(msg.sender, bidder, tokenId);
        
        // Transfer funds to seller and fee to marketplace owner
        payable(msg.sender).transfer(sellerAmount);
        payable(owner()).transfer(fee);
        
        // Clear bid
        delete highestBids[nftContract][tokenId];
        
        // Clear listing if exists
        if (listings[nftContract][tokenId].isActive) {
            listings[nftContract][tokenId].isActive = false;
        }
        
        emit BidAccepted(nftContract, tokenId, bidder, msg.sender, bidAmount);
    }
    
    /**
     * @dev Withdraw a bid (only bidder can withdraw their bid)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to withdraw bid for
     */
    function withdrawBid(address nftContract, uint256 tokenId) external nonReentrant {
        Bid storage bid = highestBids[nftContract][tokenId];
        require(bid.bidder == msg.sender, "Not the bidder");
        
        uint256 bidAmount = bid.amount;
        
        // Clear bid
        delete highestBids[nftContract][tokenId];
        
        // Refund bidder
        payable(msg.sender).transfer(bidAmount);
        
        emit BidWithdrawn(nftContract, tokenId, msg.sender);
    }
    
    /**
     * @dev Update marketplace fee percentage (only owner)
     * @param newFee New fee in basis points (100 = 1%)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee exceeds maximum");
        
        uint256 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        
        emit MarketplaceFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Check if an NFT has an active listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return bool Whether the NFT has an active listing
     */
    function hasActiveListing(address nftContract, uint256 tokenId) external view returns (bool) {
        return listings[nftContract][tokenId].isActive;
    }
    
    /**
     * @dev Get listing details
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to get listing for
     * @return Listing struct containing listing details
     */
    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }
    
    /**
     * @dev Get highest bid details
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to get bid for
     * @return Bid struct containing highest bid details
     */
    function getHighestBid(address nftContract, uint256 tokenId) external view returns (Bid memory) {
        return highestBids[nftContract][tokenId];
    }
    
    /**
     * @dev Execute purchase logic (common between direct purchase and accepted bids)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID being purchased
     * @param buyer Address of the buyer
     * @param price Purchase price
     */
    function _executePurchase(
        address nftContract,
        uint256 tokenId,
        address buyer,
        uint256 price
    ) private {
        Listing storage listing = listings[nftContract][tokenId];
        address seller = listing.seller;
        
        // Calculate fee
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Update listing status
        listing.isActive = false;
        
        // Transfer NFT to buyer
        IERC721(nftContract).transferFrom(seller, buyer, tokenId);
        
        // Transfer payment to seller
        payable(seller).transfer(sellerAmount);
        
        // Transfer fee to marketplace owner
        payable(owner()).transfer(fee);
        
        // Clear any bids
        if (highestBids[nftContract][tokenId].bidder != address(0)) {
            // Refund the highest bidder
            uint256 bidAmount = highestBids[nftContract][tokenId].amount;
            address bidder = highestBids[nftContract][tokenId].bidder;
            delete highestBids[nftContract][tokenId];
            payable(bidder).transfer(bidAmount);
        }
        
        emit ListingPurchased(nftContract, tokenId, buyer, seller, price);
    }
    
    /**
     * @dev Prevents a contract from calling itself, directly or indirectly
     */
    modifier nonReentrant() {
        require(_notEntered, "ReentrancyGuard: reentrant call");
        _notEntered = false;
        _;
        _notEntered = true;
    }

    // --- Collection Marketplace Functions ---

    /**
     * @dev Create a listing for an entire collection, represented by its main token.
     * @param collectionId The ID of the collection to list (from PlatzLandNFTWithCollections contract)
     * @param price Listing price for the collection
     * @param paymentToken Address of the payment token (use address(0) for ETH)
     */
    function listCollection(
        uint256 collectionId,
        uint256 price,
        address paymentToken // Typically address(0) for ETH
    ) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        
        // Get collection details from the NFT contract
        (,, uint256 mainTokenId,,,) = platzNftContract.getCollection(collectionId);
        require(mainTokenId != 0, "Collection main token not found");

        address seller = platzNftContract.ownerOf(mainTokenId);
        require(seller == msg.sender, "Not the owner of the collection's main token");

        // Check if the main token (representing the collection) is approved for marketplace
        // This implies the owner of the main token approves the marketplace to transfer it upon sale.
        require(
            platzNftContract.getApproved(mainTokenId) == address(this) || 
            platzNftContract.isApprovedForAll(seller, address(this)),
            "Marketplace not approved to transfer collection's main token"
        );
        
        // Create the collection listing
        collectionListings[collectionId] = CollectionListing({
            seller: seller,
            mainTokenId: mainTokenId,
            price: price,
            paymentToken: paymentToken,
            isActive: true
        });
        
        emit CollectionListed(collectionId, mainTokenId, seller, price, paymentToken);
    }

    /**
     * @dev Update a collection listing's price
     * @param collectionId The ID of the collection
     * @param newPrice New listing price
     */
    function updateCollectionListingPrice(
        uint256 collectionId,
        uint256 newPrice
    ) external nonReentrant {
        require(newPrice > 0, "Price must be greater than zero");
        
        CollectionListing storage listing = collectionListings[collectionId];
        require(listing.seller == msg.sender, "Not the collection listing seller");
        require(listing.isActive, "Collection listing not active");
        
        listing.price = newPrice;
        
        emit CollectionListingUpdated(collectionId, newPrice);
    }

    /**
     * @dev Cancel a collection listing
     * @param collectionId The ID of the collection
     */
    function cancelCollectionListing(uint256 collectionId) external nonReentrant {
        CollectionListing storage listing = collectionListings[collectionId];
        require(listing.seller == msg.sender, "Not the collection listing seller");
        require(listing.isActive, "Collection listing not active");
        
        listing.isActive = false;
        
        emit CollectionListingCancelled(collectionId);
    }

    /**
     * @dev Purchase a listed collection (its main token) with ETH
     * @param collectionId The ID of the collection to purchase
     */
    function purchaseCollection(uint256 collectionId) external payable nonReentrant {
        CollectionListing storage listing = collectionListings[collectionId];
        require(listing.isActive, "Collection listing not active");
        require(listing.paymentToken == address(0), "Collection listing not in ETH"); // Assuming ETH for now
        require(msg.value >= listing.price, "Insufficient payment for collection");
        
        address seller = listing.seller;
        uint256 mainTokenId = listing.mainTokenId;
        uint256 price = listing.price;

        // Update listing status
        listing.isActive = false;
        
        // Calculate fee
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer the main token of the collection to buyer
        // This signifies transfer of the "representation" of the collection.
        // The buyer now owns the main token and implicitly the rights associated with the collection
        // as per the platform's rules. Individual child tokens are not transferred here.
        platzNftContract.safeTransferFrom(seller, msg.sender, mainTokenId);
        
        // Transfer payment to seller
        payable(seller).transfer(sellerAmount);
        
        // Transfer fee to marketplace owner
        payable(owner()).transfer(fee);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit CollectionPurchased(collectionId, mainTokenId, msg.sender, seller, price);
    }

    /**
     * @dev Get collection listing details
     * @param collectionId The ID of the collection
     * @return seller The seller's address
     * @return mainTokenId The main token ID of the collection
     * @return price The price of the collection
     * @return paymentToken The payment token address
     * @return isActive Whether the listing is active
     */
    function getCollectionListing(uint256 collectionId) external view returns (
        address seller,
        uint256 mainTokenId,
        uint256 price,
        address paymentToken,
        bool isActive
    ) {
        CollectionListing storage listing = collectionListings[collectionId];
        return (
            listing.seller,
            listing.mainTokenId,
            listing.price,
            listing.paymentToken,
            listing.isActive
        );
    }

    // --- End of Collection Marketplace Functions ---
}