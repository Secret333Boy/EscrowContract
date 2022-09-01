// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ERC721Escrow {
  ERC721URIStorage tokenManager;
  mapping(address => uint256[]) private receiverItemsAddress;
  mapping(address => address[]) private rollbackItemAddresses;
  mapping(address => mapping(address => bool)) private rollbackItemPossible;
  mapping(address => mapping(address => uint256[])) private rollbackItems;

  event LogItemSend(address indexed sender, address indexed to, uint256 item);

  event LogItemWithDraw(address indexed to, uint256 item);

  event LogItemRolledBack(
    address indexed sender,
    address indexed to,
    uint256 item
  );

  constructor(ERC721URIStorage _tokenManager) {
    tokenManager = _tokenManager;
  }

  function sendGameItem(address to, uint256 tokenId) public {
    address from = msg.sender;
    require(
      tokenManager.ownerOf(tokenId) == msg.sender,
      "You don't own this ERC721 token"
    );
    require(
      tokenManager.getApproved(tokenId) == address(this),
      "Check the token allowance"
    );
    tokenManager.transferFrom(from, address(this), tokenId);
    receiverItemsAddress[to].push(tokenId);
    if (!rollbackItemPossible[to][from]) delete rollbackItems[to][from];
    rollbackItems[to][from].push(tokenId);
    rollbackItemPossible[to][from] = true;
    rollbackItemAddresses[to].push(from);
    emit LogItemSend(from, to, tokenId);
  }

  function withdrawGameItem() public {
    address to = msg.sender;
    uint256[] memory items = receiverItemsAddress[to];
    require(items.length != 0, "You don't have ERC721 tokens sent to you");
    for (uint256 i = 0; i < items.length; i++) {
      tokenManager.transferFrom(address(this), to, items[i]);
      emit LogItemWithDraw(msg.sender, items[i]);
    }
    delete receiverItemsAddress[to];
    for (uint256 i = 0; i < rollbackItemAddresses[to].length; i++) {
      address from = rollbackItemAddresses[to][i];
      rollbackItemPossible[to][from] = false;
      delete rollbackItemAddresses[to][i];
    }
  }

  function rollbackGameItem(address to) public {
    address sender = msg.sender;
    require(
      rollbackItemPossible[to][sender],
      "Rollback is not available for you. ERC721 tokens might be already withdrawed"
    );
    uint256[] memory items = rollbackItems[to][sender];
    require(items.length != 0, "There is no ERC721 tokens to rollback");
    for (uint256 i = 0; i < items.length; i++) {
      tokenManager.transferFrom(address(this), msg.sender, items[i]);

      for (uint256 j = 0; j < receiverItemsAddress[to].length; j++) {
        if (receiverItemsAddress[to][j] == items[i]) {
          delete receiverItemsAddress[to][j];
          break;
        }
      }
    }
    delete rollbackItems[to][sender];
    rollbackItemPossible[to][sender] = false;
    for (uint256 i = 0; i < rollbackItemAddresses[to].length; i++) {
      address from = rollbackItemAddresses[to][i];
      if (from == sender) {
        delete rollbackItemAddresses[to][i];
        break;
      }
    }
  }

  function inventory() public view returns (uint256) {
    return tokenManager.balanceOf(address(this));
  }
}
