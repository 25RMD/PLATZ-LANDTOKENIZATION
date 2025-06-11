// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PlatzLandNFTWithCollections
 * @dev ERC721 token representing land properties on the Platz platform with collection management
 */
contract PlatzLandNFTWithCollections is ERC721URIStorage, Ownable {
    // NFT token ID counter
    uint256 private _nextTokenId;
    
    // Collection counter
    uint256 private _nextCollectionId = 1;
    
    // Collection struct to store collection metadata
    struct Collection {
        uint256 startTokenId;
        uint256 totalSupply;
        uint256 mainTokenId;
        string baseURI;
        string collectionURI;
        address creator;
        bool exists;
    }
    
    // Token to collection mapping
    mapping(uint256 => uint256) private _tokenToCollection;
    
    // Collection data
    mapping(uint256 => Collection) private _collections;
    
    // Array to track all collection IDs (for efficient retrieval)
    uint256[] private _allCollectionIds;
    
    // Property data structure
    struct Property {
        string propertyReference; // External reference to property details (e.g. land registry number)
        address creator;          // Address of the creator/minter
        uint256 mintTimestamp;    // When the NFT was minted
    }
    
    // Mapping from token ID to property data
    mapping(uint256 => Property) private _properties;

    // Events
    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string propertyReference);
    event CollectionCreated(uint256 indexed collectionId, uint256 indexed mainTokenId, address indexed creator);
    event BatchMinted(uint256 indexed collectionId, uint256 startTokenId, uint256 quantity);

    /**
     * @dev Constructor
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) 
        ERC721("Platz Land Token", "PLTZ") 
        Ownable(initialOwner) 
    {}

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     * Overridden to support specific URIs for main tokens and baseURI construction for child tokens.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _superTokenURI = super.tokenURI(tokenId); // Check if ERC721URIStorage has a specific URI

        if (bytes(_superTokenURI).length > 0) {
            return _superTokenURI; // Return specific URI if set (e.g., for mainTokenId)
        }

        // If no specific URI, check if it belongs to a collection and construct from baseURI
        uint256 collectionId = _tokenToCollection[tokenId];
        if (collectionId != 0) { // Check if token is part of a collection
            Collection storage collection = _collections[collectionId];
            if (bytes(collection.baseURI).length > 0) {
                // Ensure we don't accidentally override a main token that *should* have had a specific URI but didn't.
                // This logic assumes child tokens *always* use the baseURI if their specific URI isn't set.
                return string(abi.encodePacked(collection.baseURI, Strings.toString(tokenId), ".json"));
            }
        }
        
        return ""; // Fallback: return empty string if no URI can be determined, as per ERC721 standard
    }

    /**
     * @dev Create a new collection with batch minting
     * @param to Address to mint tokens to
     * @param mainTokenURI URI for the main token
     * @param quantity Number of tokens to mint
     * @param collectionURI URI for collection metadata
     * @param baseURI Base URI for child tokens
     * @return collectionId The new collection ID
     * @return mainTokenId The main token ID of the collection
     */
    function createCollection(
        address to,
        string calldata mainTokenURI,
        uint256 quantity,
        string calldata collectionURI,
        string calldata baseURI
    ) public returns (uint256, uint256) {
        require(quantity > 0, "Quantity must be greater than 0");
        
        // Create main token
        uint256 mainTokenId = _nextTokenId++;
        _mint(to, mainTokenId);
        _setTokenURI(mainTokenId, mainTokenURI);
        
        // Create collection
        uint256 collectionId = _nextCollectionId++;
        uint256 startTokenId = _nextTokenId;
        
        // Store collection data
        _collections[collectionId] = Collection({
            startTokenId: startTokenId,
            totalSupply: quantity + 1, // +1 to account for the main token
            mainTokenId: mainTokenId,
            baseURI: baseURI,
            collectionURI: collectionURI,
            creator: msg.sender,
            exists: true
        });
        
        // Add to collection array
        _allCollectionIds.push(collectionId);
        
        // Map main token to collection
        _tokenToCollection[mainTokenId] = collectionId;
        
        // Mint additional tokens
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _mint(to, tokenId);
            _tokenToCollection[tokenId] = collectionId;
        }
        
        emit CollectionCreated(collectionId, mainTokenId, msg.sender);
        emit BatchMinted(collectionId, startTokenId, quantity);
        
        return (collectionId, mainTokenId);
    }

    /**
     * @dev Get collection details
     * @param collectionId The collection ID
     * @return startTokenId The start token ID
     * @return totalSupply The total supply
     * @return mainTokenId The main token ID
     * @return baseURI The base URI
     * @return collectionURI The collection URI
     * @return creator The creator address
     */
    function getCollection(uint256 collectionId) public view returns (
        uint256 startTokenId,
        uint256 totalSupply,
        uint256 mainTokenId,
        string memory baseURI,
        string memory collectionURI,
        address creator
    ) {
        require(_collections[collectionId].exists, "Collection does not exist");
        Collection memory collection = _collections[collectionId];
        
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
     * @dev Get collection IDs with pagination
     * @param offset The offset (starting index)
     * @param limit The maximum number of items to return
     * @return Array of collection IDs for the requested page
     */
    function getCollectionsPaginated(uint256 offset, uint256 limit) public view returns (uint256[] memory) {
        uint256 totalCollections = _allCollectionIds.length;
        
        if (offset >= totalCollections) {
            return new uint256[](0);
        }
        
        uint256 count = (offset + limit > totalCollections) ? totalCollections - offset : limit;
        uint256[] memory result = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = _allCollectionIds[offset + i];
        }
        
        return result;
    }

    /**
     * @dev Get the collection ID for a token
     * @param tokenId The token ID
     * @return The collection ID
     */
    function getTokenCollection(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenToCollection[tokenId];
    }

    /**
     * @dev Check if a token exists
     * @param tokenId The token ID to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Mint a new land NFT
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
     * @dev Retrieve property information for a token
     * @param tokenId The token ID
     * @return Property struct containing property details
     */
    function getPropertyDetails(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Token does not exist");
        return _properties[tokenId];
    }
    
    /**
     * @dev Burn a token - only the owner or approved address can burn
     * @param tokenId The token ID to burn
     */
    function burn(uint256 tokenId) external {
        // Check if caller is owner or approved
        address owner = ownerOf(tokenId);
        require(
            _isAuthorized(owner, msg.sender, tokenId),
            "PlatzLandNFT: caller is not owner nor approved"
        );
        
        // Burn the token
        _burn(tokenId);
        
        // Clean up property data
        delete _properties[tokenId];
    }

    /**
     * @dev Updates the token URI for a given token.
     * Can be used to update the URI of a main collection token or any individually minted token.
     * Only the contract owner can call this function.
     * @param tokenId The ID of the token to update.
     * @param newTokenURI The new URI for the token.
     */
    function updateTokenURI(uint256 tokenId, string calldata newTokenURI) public onlyOwner {
        require(_exists(tokenId), "ERC721URIStorage: URI update for nonexistent token");
        _setTokenURI(tokenId, newTokenURI);
    }
}