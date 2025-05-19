// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlatzLandNFTWithCollections
 * @dev ERC721 token representing land properties on the Platz platform
 * with optimized collection tracking
 */
contract PlatzLandNFTWithCollections is ERC721URIStorage, Ownable {
    // NFT token ID counter
    uint256 private _nextTokenId;
    
    // Collection ID counter
    uint256 private _nextCollectionId;
    
    // Property data structure
    struct Property {
        string propertyReference; // External reference to property details (e.g. land registry number)
        address creator;          // Address of the creator/minter
        uint256 mintTimestamp;    // When the NFT was minted
    }
    
    // Collection data structure
    struct Collection {
        uint256 startTokenId;     // First token ID in this collection
        uint256 totalSupply;      // Number of tokens in this collection
        uint256 mainTokenId;      // ID of the main token representing the collection
        string baseURI;           // Base URI for child tokens
        string collectionURI;     // Metadata URI for the collection itself
        address creator;          // Address of the creator
    }
    
    // Mapping from token ID to property data
    mapping(uint256 => Property) private _properties;
    
    // Mapping from collection ID to collection data
    mapping(uint256 => Collection) private _collections;
    
    // Mapping from token ID to collection ID
    mapping(uint256 => uint256) private _tokenCollections;
    
    // Array to track all collection IDs for efficient querying
    uint256[] private _allCollectionIds;

    // Events
    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string propertyReference);
    event CollectionCreated(uint256 indexed collectionId, uint256 indexed mainTokenId, address indexed creator);
    event BatchMinted(uint256 indexed collectionId, uint256 startTokenId, uint256 quantity);

    /**
     * @dev Constructor
     * @param name Name of the NFT token
     * @param symbol Symbol of the NFT token
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender)
    {}

    /**
     * @dev Create a new collection with main token and child tokens
     * @param to Address to mint the tokens to
     * @param mainTokenURI URI for the main token
     * @param quantity Number of child tokens to mint
     * @param collectionURI URI for the collection metadata
     * @param baseURI Base URI for child tokens
     * @return collectionId The new collection ID
     * @return mainTokenId The ID of the main token
     */
    function createCollection(
        address to,
        string calldata mainTokenURI,
        uint256 quantity,
        string calldata collectionURI,
        string calldata baseURI
    ) public returns (uint256, uint256) {
        require(quantity > 0, "Quantity must be greater than 0");
        
        // Mint main token
        uint256 mainTokenId = _nextTokenId++;
        _mint(to, mainTokenId);
        _setTokenURI(mainTokenId, mainTokenURI);
        
        // Create collection
        uint256 collectionId = _nextCollectionId++;
        uint256 startTokenId = _nextTokenId;
        
        _collections[collectionId] = Collection({
            startTokenId: startTokenId,
            totalSupply: quantity,
            mainTokenId: mainTokenId,
            baseURI: baseURI,
            collectionURI: collectionURI,
            creator: msg.sender
        });
        
        // Associate main token with collection
        _tokenCollections[mainTokenId] = collectionId;
        
        // Add to collection IDs array
        _allCollectionIds.push(collectionId);
        
        // Emit collection created event
        emit CollectionCreated(collectionId, mainTokenId, msg.sender);
        
        // Mint child tokens
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _mint(to, tokenId);
            // Associate with collection
            _tokenCollections[tokenId] = collectionId;
        }
        
        // Emit batch minted event
        emit BatchMinted(collectionId, startTokenId, quantity);
        
        return (collectionId, mainTokenId);
    }
    
    /**
     * @dev Mint a single land NFT (not part of a collection)
     * @param to Address to mint the token to
     * @param uri URI for the token metadata
     * @return The new token ID
     */
    function safeMint(address to, string calldata uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
    
    /**
     * @dev Get collection data
     * @param collectionId The ID of the collection
     * @return Collection data (startTokenId, totalSupply, mainTokenId, baseURI, collectionURI, creator)
     */
    function getCollection(uint256 collectionId) public view returns (
        uint256, uint256, uint256, string memory, string memory, address
    ) {
        Collection memory collection = _collections[collectionId];
        require(collection.mainTokenId > 0, "Collection does not exist");
        
        return (
            collection.startTokenId,
            collection.totalSupply,
            collection.mainTokenId,
            collection.baseURI,
            collection.collectionURI,
            collection.creator
        );
    }
    
    /**
     * @dev Get the collection ID for a token
     * @param tokenId The ID of the token
     * @return The collection ID
     */
    function getTokenCollection(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenCollections[tokenId];
    }
    
    /**
     * @dev Get the total number of collections
     * @return The total number of collections
     */
    function getCollectionCount() public view returns (uint256) {
        return _allCollectionIds.length;
    }
    
    /**
     * @dev Get all collection IDs
     * @return Array of all collection IDs
     */
    function getAllCollectionIds() public view returns (uint256[] memory) {
        return _allCollectionIds;
    }
    
    /**
     * @dev Get a paginated list of collection IDs
     * @param offset Starting index
     * @param limit Maximum number of collections to return
     * @return Array of collection IDs
     */
    function getCollectionsPaginated(uint256 offset, uint256 limit) public view returns (uint256[] memory) {
        uint256 collectionCount = _allCollectionIds.length;
        
        if (offset >= collectionCount) {
            return new uint256[](0);
        }
        
        uint256 endIndex = offset + limit;
        if (endIndex > collectionCount) {
            endIndex = collectionCount;
        }
        
        uint256[] memory result = new uint256[](endIndex - offset);
        for (uint256 i = offset; i < endIndex; i++) {
            result[i - offset] = _allCollectionIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Mint a new land NFT with property details
     * @param to Address to mint the token to
     * @param propertyReference External reference to property details
     * @param metadataURI URI containing metadata for the token
     * @return tokenId The new token ID
     */
    function mintLand(
        address to,
        string calldata propertyReference,
        string calldata metadataURI
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
            
        _properties[tokenId] = Property({
            propertyReference: propertyReference,
            creator: msg.sender,
            mintTimestamp: block.timestamp
        });
        
        emit PropertyMinted(tokenId, to, propertyReference);
        
        return tokenId;
    }
    
    /**
     * @dev Get property details for a token
     * @param tokenId The ID of the token
     * @return Property details
     */
    function getPropertyDetails(uint256 tokenId) public view returns (Property memory) {
        require(_exists(tokenId), "Token does not exist");
        return _properties[tokenId];
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId The ID of the token
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Burn a token
     * @param tokenId The ID of the token to burn
     */
    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        _burn(tokenId);
        
        // Remove from collection mapping if part of a collection
        delete _tokenCollections[tokenId];
        delete _properties[tokenId];
    }
} 