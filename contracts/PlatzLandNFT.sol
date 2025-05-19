// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlatzLandNFT
 * @dev ERC721 token representing land properties on the Platz platform
 */
contract PlatzLandNFT is ERC721URIStorage, Ownable {
    // NFT token ID counter
    uint256 private _nextTokenId;
    
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

    /**
     * @dev Constructor
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) 
        ERC721("Platz Land Token", "PLTZ") 
        Ownable(initialOwner) 
    {}

    /**
     * @dev Mint a new land NFT
     * @param to Address to mint the token to
     * @param propertyReference External reference to property details
     * @param tokenURI URI containing metadata for the token
     * @return tokenId The new token ID
     */
    function mintLand(
        address to,
        string calldata propertyReference,
        string calldata tokenURI
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(to, tokenId);
            _setTokenURI(tokenId, tokenURI);
            
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
        _requireOwned(tokenId);
        return _properties[tokenId];
    }
    
    /**
     * @dev Check if a token ID exists
     * @param tokenId The token ID to check
     * @return bool Whether the token exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
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
}
