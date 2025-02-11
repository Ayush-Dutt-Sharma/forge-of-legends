// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./GameLogic.sol";

contract Forge {

    GameLogic private _gameAddress;
    address public _owner;
    uint256 public constant ITEM_RATE = 1;
    mapping(uint256 => uint[]) private _itemsRequirements;
    mapping(uint256 => bool) private _tradableItems;

    event ItemMinted(address _to, uint id);
    event ItemTraded(address _to, uint id, uint burnId);

    constructor(address gameAddress_){
        _owner = msg.sender;
        _gameAddress = GameLogic(gameAddress_);
        _setItemRequires();
        _setTradableItems();

    }

     function _setItemRequires() private {
        _itemsRequirements[3] = [0, 1];
        _itemsRequirements[4] = [1, 2];
        _itemsRequirements[5] = [0, 2];
        _itemsRequirements[6] = [0, 1, 2];
    }

    function _setTradableItems() private {
        _tradableItems[0] = true;
        _tradableItems[1] = true;
        _tradableItems[2] = true;
    }
    
   function tradeItem(uint _id,uint _burnId ) external {
        if(!(_tradableItems[_id] && _tradableItems[_burnId] && _id != _burnId )){
            revert("Items not tradeable");
            
        }
        _gameAddress.burn(msg.sender, _burnId, ITEM_RATE);
        _gameAddress.mint(msg.sender, _id, ITEM_RATE);
        emit ItemTraded(msg.sender, _id, _burnId);(msg.sender, _id);
    
   }

   function mintToken(uint _id) external{
        require(_id<3, "You can mint only 0 to 2");
        _gameAddress.mint(msg.sender, _id, ITEM_RATE);
        emit ItemMinted(msg.sender, _id);
   }

   function forgeItem(uint _tokenId) external{

        require(_itemsRequirements[_tokenId].length > 0,"Not a valid Id");
        uint[] memory _ids = _itemsRequirements[_tokenId];
        uint[] memory _values =new uint[](_ids.length);
        for (uint i = 0; i < _ids.length; i++) {
                require(_gameAddress.balanceOf(msg.sender, _ids[i]) >= ITEM_RATE, "Insufficient balance to forge.");
                _values[i] = ITEM_RATE;
            }
        _gameAddress.burnBatch(msg.sender, _ids, _values);
        _gameAddress.mint(msg.sender,_tokenId,ITEM_RATE);
   }

}

