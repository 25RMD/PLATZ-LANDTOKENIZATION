// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlatzLandNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId; // Start token IDs from 1

    // Mapping from token ID to a simple property identifier or reference
    mapping(uint256 => string) private _propertyReferences;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string propertyReference
    );

    constructor(address initialOwner)
        ERC721("PlatzLandToken", "PLT")
        Ownable(initialOwner)
    {
        _nextTokenId = 1; // Initialize token IDs to start from 1
    }

    function safeMint(address to, string memory uri, string memory propertyRef)
        public
        onlyOwner
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++; // Increment for the next mint
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _propertyReferences[tokenId] = propertyRef; // Store the property reference

        emit NFTMinted(to, tokenId, uri, propertyRef);
    }

    // The following functions are overrides required by Solidity.

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Function to retrieve the property reference for a given token ID
    function getPropertyReference(uint256 tokenId) public view returns (string memory) {
        ownerOf(tokenId);
        return _propertyReferences[tokenId];
    }
} 