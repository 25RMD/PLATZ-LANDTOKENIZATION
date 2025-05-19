// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PlatzLandNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    // Collection tracking
    struct Collection {
        uint256 startTokenId;
        uint256 totalSupply;
        uint256 mainTokenId;
        string baseURI;
        string collectionURI;
        address creator;
    }

    // Mapping from collection ID to Collection
    mapping(uint256 => Collection) private _collections;
    Counters.Counter private _collectionIdCounter;

    // Token to collection mapping
    mapping(uint256 => uint256) private _tokenToCollection;

    // Events
    event CollectionCreated(uint256 indexed collectionId, uint256 indexed mainTokenId, address indexed creator);
    event BatchMinted(uint256 indexed collectionId, uint256 startTokenId, uint256 quantity);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mints a new token.
     * @param to The address that will own the minted token
     * @param uri URI for token metadata
     * @return tokenId The ID of the newly minted token
     */
    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Creates a new collection with multiple tokens.
     * @param to The address that will own the minted tokens
     * @param mainTokenURI URI for the main token metadata
     * @param quantity Number of tokens to mint in the collection
     * @param collectionURI URI for the collection metadata
     * @return collectionId The ID of the newly created collection
     * @return mainTokenId The ID of the main token in the collection
     */
    function createCollection(
        address to,
        string memory mainTokenURI,
        uint256 quantity,
        string memory collectionURI,
        string memory baseURI
    ) public onlyRole(MINTER_ROLE) returns (uint256, uint256) {
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= 1000, "Cannot create more than 1000 tokens at once");

        // Create collection
        uint256 collectionId = _collectionIdCounter.current();
        _collectionIdCounter.increment();

        uint256 startTokenId = _tokenIdCounter.current();
        uint256 mainTokenId = startTokenId;

        // Create the main token
        _safeMint(to, mainTokenId);
        _setTokenURI(mainTokenId, mainTokenURI);
        _tokenIdCounter.increment();

        // Create additional tokens if needed
        for (uint256 i = 1; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(to, tokenId);
            
            // Set token URI based on base URI and token number in collection
            string memory tokenURI = string(abi.encodePacked(baseURI, "/", _toString(i)));
            _setTokenURI(tokenId, tokenURI);
            
            // Add token to collection
            _tokenToCollection[tokenId] = collectionId;
            _tokenIdCounter.increment();
        }

        // Store collection data
        _collections[collectionId] = Collection({
            startTokenId: startTokenId,
            totalSupply: quantity,
            mainTokenId: mainTokenId,
            baseURI: baseURI,
            collectionURI: collectionURI,
            creator: to
        });

        // Associate main token with collection
        _tokenToCollection[mainTokenId] = collectionId;

        emit CollectionCreated(collectionId, mainTokenId, to);
        emit BatchMinted(collectionId, startTokenId, quantity);

        return (collectionId, mainTokenId);
    }

    /**
     * @dev Gets collection details
     * @param collectionId The ID of the collection
     * @return Collection struct with collection details
     */
    function getCollection(uint256 collectionId) external view returns (
        uint256 startTokenId,
        uint256 totalSupply,
        uint256 mainTokenId,
        string memory baseURI,
        string memory collectionURI,
        address creator
    ) {
        Collection storage collection = _collections[collectionId];
        require(collection.creator != address(0), "Collection does not exist");
        
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
     * @dev Gets the collection ID for a token
     * @param tokenId The token ID
     * @return The collection ID
     */
    function getTokenCollection(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenToCollection[tokenId];
    }

    /**
     * @dev Utility function to convert uint to string
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

    /**
     * @dev Checks if a token exists
     * @param tokenId The token ID to check
     * @return Whether the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 