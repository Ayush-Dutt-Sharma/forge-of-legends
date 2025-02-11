// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GameLogic is ERC1155 {
    string private _url =
        "ipfs://bafybeihhb47owjcaqoqbtxpmu35wmvn625xzvqaq4uhdxhr7vjaa4rfxmy/";

    address public _owner ;
    uint[] private _items = [0,1,2,3,4,5,6];
    mapping(address => uint256) public lastMint;
    uint256 public immutable coolDownMintTime ;
    address public forgeContract;

    error MintInCoolDown();
    error InvalidTokenId();

    constructor(uint _coolDownMintTime) ERC1155("ipfs://bafybeihhb47owjcaqoqbtxpmu35wmvn625xzvqaq4uhdxhr7vjaa4rfxmy/"){
        _owner=msg.sender;
        coolDownMintTime = _coolDownMintTime;
    }

    modifier isValidTokenId(uint256 tokenId) {
        if (tokenId > 6) {
            revert InvalidTokenId();
        }
        _;
    }
    modifier onlyForge() {
        require(msg.sender == forgeContract, "Not authorized: Only forge contract can call this.");
    _;
    }

    function setForgeContract(address _forgeContract) external {
        require(forgeContract == address(0), "Forge contract already set");
        require(msg.sender == _owner, "Only owner can set forge contract");
        forgeContract = _forgeContract;
    }


    function burnBatch(address _from, uint[] calldata _ids, uint[] calldata _values) external onlyForge{
        _burnBatch(_from, _ids, _values);
    }

    function burn(address _from, uint _id, uint _value) external onlyForge{
        _burn(_from,_id,_value);
    }

    function mint(address _to, uint _id, uint _value) external onlyForge{
         if (_id <= 2) {
            if (block.timestamp - lastMint[msg.sender] < coolDownMintTime) {
            revert MintInCoolDown();
            }
        lastMint[msg.sender] = block.timestamp;
         }
        _mint(_to, _id, _value, "");
    }

    function uri(
        uint256 _id
    ) public view override isValidTokenId(_id) returns (string memory) {
        return string.concat(_url, Strings.toString(_id));
    }
}