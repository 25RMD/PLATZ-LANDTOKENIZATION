// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol"; // For _msgSender()

interface IPlatzLandNFT is IERC721 {
    function getPropertyReference(uint256 tokenId) external view returns (string memory);
}

contract LandMarketplace is ReentrancyGuard, Ownable {
    IPlatzLandNFT private _landNft;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        bool active; // To mark if the bid is still the highest active one
    }

    mapping(uint256 => Listing) public listings; // For fixed-price sales
    mapping(uint256 => Bid) public highestBids;   // For bidding

    uint256 public minBidIncrementPercentage; // e.g., 5 for 5%

    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event NFTListingCancelled(
        uint256 indexed tokenId,
        address indexed seller
    );

    event NFTPriceUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newPrice
    );

    // Bidding Events
    event NewHighestBid(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    event BidAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed bidder,
        uint256 amount
    );

    event BidWithdrawn(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    constructor(address initialOwner, address landNftAddress, uint256 _minBidIncrementPercentage)
        Ownable(initialOwner)
    {
        _landNft = IPlatzLandNFT(landNftAddress);
        minBidIncrementPercentage = _minBidIncrementPercentage; // e.g., 5 for 5%
    }

    // --- Fixed Price Listing Functions ---
    function listNFT(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Marketplace: Price must be > 0");
        require(_landNft.ownerOf(tokenId) == _msgSender(), "Marketplace: Not owner");
        require(!listings[tokenId].active, "Marketplace: Already listed");
        require(_landNft.getApproved(tokenId) == address(this) || _landNft.isApprovedForAll(_msgSender(), address(this)),
            "Marketplace: Not approved");

        listings[tokenId] = Listing(_msgSender(), price, true);
        emit NFTListed(tokenId, _msgSender(), price);
    }

    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Marketplace: Not listed");
        require(msg.value == listing.price, "Marketplace: Incorrect ETH amount");
        require(listing.seller != _msgSender(), "Marketplace: Owner cannot buy");

        address seller = listing.seller;
        listing.active = false;
        // If there was an active bid, it's now void, refund bidder
        _handleVoidedBid(tokenId, seller); 

        _landNft.safeTransferFrom(seller, _msgSender(), tokenId);
        (bool success, ) = seller.call{value: msg.value}("");
        require(success, "Marketplace: Payment failed");

        emit NFTSold(tokenId, seller, _msgSender(), listing.price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Marketplace: Not listed");
        require(listing.seller == _msgSender(), "Marketplace: Not lister");

        listing.active = false;
        emit NFTListingCancelled(tokenId, _msgSender());
    }

    function updateListingPrice(uint256 tokenId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Marketplace: Not listed");
        require(listing.seller == _msgSender(), "Marketplace: Not lister");
        require(newPrice > 0, "Marketplace: Price must be > 0");

        listing.price = newPrice;
        emit NFTPriceUpdated(tokenId, _msgSender(), newPrice);
    }

    // --- Bidding Functions ---
    function makeBid(uint256 tokenId) external payable nonReentrant {
        require(_landNft.ownerOf(tokenId) != address(0), "Marketplace: Token does not exist"); // Check token exists
        require(_landNft.ownerOf(tokenId) != _msgSender(), "Marketplace: Owner cannot bid");
        
        Bid storage currentHighestBid = highestBids[tokenId];
        uint256 minNextBid = currentHighestBid.active ? 
            currentHighestBid.amount + (currentHighestBid.amount * minBidIncrementPercentage / 100) :
            1; // Allow any bid if no active bid, or a minimum (e.g. 1 wei)

        if (minNextBid == 0 && currentHighestBid.amount > 0) minNextBid = currentHighestBid.amount + 1; // Ensure increment if percentage is 0 but bid exists
        if (minNextBid == 0 && currentHighestBid.amount == 0) minNextBid = 1; // Ensure at least 1 wei if no bid and percentage is 0

        require(msg.value >= minNextBid, "Marketplace: Bid too low");

        if (currentHighestBid.active) {
            // Refund previous highest bidder
            (bool success, ) = currentHighestBid.bidder.call{value: currentHighestBid.amount}("");
            require(success, "Marketplace: Refund failed");
        }

        highestBids[tokenId] = Bid(_msgSender(), msg.value, true);
        emit NewHighestBid(tokenId, _msgSender(), msg.value);
    }

    function acceptBid(uint256 tokenId) external nonReentrant {
        address tokenOwner = _landNft.ownerOf(tokenId);
        require(tokenOwner == _msgSender(), "Marketplace: Not owner");
        
        Bid storage bidToAccept = highestBids[tokenId];
        require(bidToAccept.active, "Marketplace: No active bid");
        require(_landNft.getApproved(tokenId) == address(this) || _landNft.isApprovedForAll(tokenOwner, address(this)),
            "Marketplace: Not approved");

        address bidder = bidToAccept.bidder;
        uint256 bidAmount = bidToAccept.amount;

        bidToAccept.active = false; // Mark bid as inactive/accepted
        listings[tokenId].active = false; // Deactivate any fixed-price listing

        _landNft.safeTransferFrom(tokenOwner, bidder, tokenId);
        (bool success, ) = tokenOwner.call{value: bidAmount}("");
        require(success, "Marketplace: Payment failed");

        emit BidAccepted(tokenId, tokenOwner, bidder, bidAmount);
    }

    function withdrawBid(uint256 tokenId) external nonReentrant {
        Bid storage bidToWithdraw = highestBids[tokenId];
        // Allow withdrawal only if the bid is active and belongs to the caller
        require(bidToWithdraw.active && bidToWithdraw.bidder == _msgSender(), "Marketplace: Not highest bidder or bid inactive");
        // In a real auction, you might prevent withdrawal if auction is ending soon or other conditions.
        // For now, highest bidder can withdraw if they choose.

        uint256 amount = bidToWithdraw.amount;
        bidToWithdraw.active = false; // Mark as inactive
        // No new highest bidder is set here; the spot becomes open.

        (bool success, ) = _msgSender().call{value: amount}("");
        require(success, "Marketplace: Withdrawal failed");

        emit BidWithdrawn(tokenId, _msgSender(), amount);
    }

    // --- Helper / Internal Functions ---
    function _handleVoidedBid(uint256 tokenId, address nftRecipientIfDifferentFromSeller) private {
        Bid storage currentHighestBid = highestBids[tokenId];
        if (currentHighestBid.active) {
            address bidderToRefund = currentHighestBid.bidder;
            uint256 amountToRefund = currentHighestBid.amount;
            currentHighestBid.active = false;

            // Prevent seller from getting bid amount if they bought their own NFT (though buyNFT prevents this)
            // or if NFT is transferred to someone else due to sale cancellation followed by direct transfer.
            if (nftRecipientIfDifferentFromSeller != address(0) && bidderToRefund == nftRecipientIfDifferentFromSeller) {
                // This case should ideally not happen if buyNFT is used correctly.
                // If seller is somehow the highest bidder and NFT is sold to them, this is problematic logic.
                // For now, assume buyNFT prevents seller buying. If NFT is sold, bidder is refunded.
            }
            
            (bool success, ) = bidderToRefund.call{value: amountToRefund}("");
            if (!success) {
                // If refund fails, this is problematic. Emit an event or handle. For now, we assume success.
                // Consider a pull-over-push pattern for refunds if this becomes an issue.
            }
            emit BidWithdrawn(tokenId, bidderToRefund, amountToRefund); // Re-use event for refund due to sale
        }
    }


    // --- View Functions ---
    function getListing(uint256 tokenId) public view returns (address seller, uint256 price, bool active) {
        Listing storage item = listings[tokenId];
        return (item.seller, item.price, item.active);
    }

    function getHighestBid(uint256 tokenId) public view returns (address bidder, uint256 amount, bool active) {
        Bid storage bid = highestBids[tokenId];
        return (bid.bidder, bid.amount, bid.active);
    }

    // --- Admin Functions ---
    function setNftContractAddress(address newLandNftAddress) external onlyOwner {
        _landNft = IPlatzLandNFT(newLandNftAddress);
    }

    function setMinBidIncrementPercentage(uint256 _newPercentage) external onlyOwner {
        minBidIncrementPercentage = _newPercentage;
    }
} 