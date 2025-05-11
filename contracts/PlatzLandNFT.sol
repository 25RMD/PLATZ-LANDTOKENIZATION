// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PlatzLandNFT
 * @dev ERC721 contract for tokenizing land properties with collection functionality
 * Each collection consists of 1 main NFT and 99 additional NFTs
 */
contract PlatzLandNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Token ID counter
    Counters.Counter private _tokenIdCounter;
    
    // Collection counter
    Counters.Counter private _collectionIdCounter;
    
    // Collection size (1 main NFT + 99 additional NFTs)
    uint256 public constant COLLECTION_SIZE = 100;
    
    // Mapping from collection ID to main token ID
    mapping(uint256 => uint256) private _collectionMainToken;
    
    // Mapping from token ID to collection ID
    mapping(uint256 => uint256) private _tokenCollection;
    
    // Mapping from collection ID to collection metadata URI
    mapping(uint256 => string) private _collectionURI;
    
    // Mapping from token ID to listing price (in wei)
    mapping(uint256 => uint256) private _tokenListingPrice;
    
    // Mapping from token ID to listing status
    mapping(uint256 => bool) private _tokenListed;

    // Events
    event CollectionCreated(uint256 indexed collectionId, uint256 mainTokenId, address indexed creator);
    event TokenListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event TokenUnlisted(uint256 indexed tokenId, address indexed seller);
    event TokenPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);

    /**
     * @dev Constructor
     */
    constructor() ERC721("Platz Land NFT", "PLATZ") Ownable(msg.sender) {}

    /**
     * @dev Create a new collection with batch minting
     * @param mainTokenURI URI for the main token metadata
     * @param additionalTokensBaseURI Base URI for additional tokens metadata
     * @param collectionMetadataURI URI for the collection metadata
     * @return collectionId The ID of the created collection
     * @return mainTokenId The ID of the main token in the collection
     */
    function createCollection(
        string memory mainTokenURI,
        string memory additionalTokensBaseURI,
        string memory collectionMetadataURI
    ) public returns (uint256 collectionId, uint256 mainTokenId) {
        // Increment collection ID
        _collectionIdCounter.increment();
        collectionId = _collectionIdCounter.current();
        
        // Store collection metadata URI
        _collectionURI[collectionId] = collectionMetadataURI;
        
        // Mint main token
        _tokenIdCounter.increment();
        mainTokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, mainTokenId);
        _setTokenURI(mainTokenId, mainTokenURI);
        
        // Associate main token with collection
        _collectionMainToken[collectionId] = mainTokenId;
        _tokenCollection[mainTokenId] = collectionId;
        
        // Mint additional tokens
        for (uint256 i = 1; i < COLLECTION_SIZE; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(msg.sender, tokenId);
            
            // Set token URI with index
            string memory tokenURI = string(abi.encodePacked(
                additionalTokensBaseURI, 
                "/", 
                _toString(i)
            ));
            _setTokenURI(tokenId, tokenURI);
            
            // Associate token with collection
            _tokenCollection[tokenId] = collectionId;
        }
        
        emit CollectionCreated(collectionId, mainTokenId, msg.sender);
        
        return (collectionId, mainTokenId);
    }

    /**
     * @dev List a token for sale
     * @param tokenId Token ID to list
     * @param price Listing price in wei
     */
    function listToken(uint256 tokenId, uint256 price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        require(price > 0, "Price must be greater than zero");
        
        _tokenListingPrice[tokenId] = price;
        _tokenListed[tokenId] = true;
        
        emit TokenListed(tokenId, price, msg.sender);
    }
    
    /**
     * @dev Remove a token from sale
     * @param tokenId Token ID to unlist
     */
    function unlistToken(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        require(_tokenListed[tokenId], "Token not listed");
        
        _tokenListed[tokenId] = false;
        
        emit TokenUnlisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Purchase a listed token
     * @param tokenId Token ID to purchase
     */
    function purchaseToken(uint256 tokenId) public payable {
        require(_tokenListed[tokenId], "Token not listed for sale");
        require(msg.value >= _tokenListingPrice[tokenId], "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        uint256 price = _tokenListingPrice[tokenId];
        
        // Transfer ownership
        _transfer(seller, msg.sender, tokenId);
        
        // Update listing status
        _tokenListed[tokenId] = false;
        
        // Transfer payment to seller
        payable(seller).transfer(price);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit TokenPurchased(tokenId, msg.sender, seller, price);
    }
    
    /**
     * @dev Get collection information
     * @param collectionId Collection ID
     * @return mainTokenId The ID of the main token in the collection
     * @return collectionURI The URI of the collection metadata
     */
    function getCollectionInfo(uint256 collectionId) public view returns (uint256 mainTokenId, string memory collectionURI) {
        require(collectionId > 0 && collectionId <= _collectionIdCounter.current(), "Invalid collection ID");
        
        mainTokenId = _collectionMainToken[collectionId];
        collectionURI = _collectionURI[collectionId];
        
        return (mainTokenId, collectionURI);
    }
    
    /**
     * @dev Get token listing information
     * @param tokenId Token ID
     * @return isListed Whether the token is listed for sale
     * @return price The listing price in wei
     * @return seller The address of the seller
     */
    function getTokenListingInfo(uint256 tokenId) public view returns (bool isListed, uint256 price, address seller) {
        require(_exists(tokenId), "Token does not exist");
        
        isListed = _tokenListed[tokenId];
        price = _tokenListingPrice[tokenId];
        seller = ownerOf(tokenId);
        
        return (isListed, price, seller);
    }
    
    /**
     * @dev Get collection ID for a token
     * @param tokenId Token ID
     * @return collectionId The ID of the collection the token belongs to
     */
    function getTokenCollection(uint256 tokenId) public view returns (uint256 collectionId) {
        require(_exists(tokenId), "Token does not exist");
        
        return _tokenCollection[tokenId];
    }
    
    /**
     * @dev Check if a token is the main token of its collection
     * @param tokenId Token ID
     * @return isMainToken Whether the token is the main token of its collection
     */
    function isMainToken(uint256 tokenId) public view returns (bool isMainToken) {
        require(_exists(tokenId), "Token does not exist");
        
        uint256 collectionId = _tokenCollection[tokenId];
        return _collectionMainToken[collectionId] == tokenId;
    }

    /**
     * @dev Convert a uint256 to its string representation
     * @param value The uint256 value to convert
     * @return The string representation of the value
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    // The following functions are overrides required by Solidity

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
