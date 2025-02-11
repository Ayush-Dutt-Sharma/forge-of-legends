//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleNFTUploader is ERC721 {
    address public deployer;
    uint private tokenId;
    uint constant MAX_SUPPLY = 7;
    constructor()ERC721("SimpleNFTUploader","SNFTU"){
        deployer = msg.sender;
    }

    function mint() external {
        require(tokenId<MAX_SUPPLY,"Exceded the Limit");
        _mint(msg.sender,tokenId);
        tokenId++;
    }

    function tokenURI(uint _tokenId) public pure override returns (string memory){
        require(_tokenId<MAX_SUPPLY,"Invalid Token ID");
        return string(abi.encodePacked(_baseURI(),Strings.toString(_tokenId)));
    }

    function _baseURI() internal  pure override returns (string memory){
        return "https://ipfs.io/ipfs/bafybeihhb47owjcaqoqbtxpmu35wmvn625xzvqaq4uhdxhr7vjaa4rfxmy/";
    }
}