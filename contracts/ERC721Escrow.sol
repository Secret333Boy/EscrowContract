// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract ERC721Escrow {
  ERC721URIStorage tokenManager;

  struct ERC721Transaction {
    address from;
    address to;
    uint256 tokenID;
  }

  mapping(address => ERC721Transaction[]) private receiverPendingTransactions;

  event LogERC721Send(address indexed sender, address indexed to, uint256 item);

  event LogERC721WithDraw(address indexed to, uint256 item);

  event LogERC721RolledBack(
    address indexed sender,
    address indexed to,
    uint256 tokenID
  );

  constructor(ERC721URIStorage _tokenManager) {
    tokenManager = _tokenManager;
  }

  function sendERC721(address _to, uint256 _tokenID) public {
    address _from = msg.sender;
    require(
      tokenManager.ownerOf(_tokenID) == msg.sender,
      "You don't own this ERC721 token"
    );
    require(
      tokenManager.getApproved(_tokenID) == address(this),
      'Check the token allowance'
    );
    tokenManager.transferFrom(_from, address(this), _tokenID);
    ERC721Transaction memory transaction = ERC721Transaction({
      from: _from,
      to: _to,
      tokenID: _tokenID
    });
    receiverPendingTransactions[_to].push(transaction);
    emit LogERC721Send(_from, _to, _tokenID);
  }

  function withdrawERC721() public {
    address to = msg.sender;
    require(
      receiverPendingTransactions[to].length != 0,
      "You don't have ERC721 tokens sent to you"
    );
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      uint256 tokenID = receiverPendingTransactions[to][i].tokenID;
      tokenManager.transferFrom(address(this), to, tokenID);
      emit LogERC721WithDraw(msg.sender, tokenID);
    }
    delete receiverPendingTransactions[to];
  }

  function rollbackERC721(address to) public {
    address sender = msg.sender;
    bool available = false;
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        available = true;
        break;
      }
    }
    require(
      available,
      'Rollback is not available for you. ERC721 tokens might be already withdrawed'
    );
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        tokenManager.transferFrom(
          address(this),
          msg.sender,
          receiverPendingTransactions[to][i].tokenID
        );
        emit LogERC721RolledBack(
          sender,
          to,
          receiverPendingTransactions[to][i].tokenID
        );
        delete receiverPendingTransactions[to][i];
      }
    }
  }

  function inventory() public view returns (uint256) {
    return tokenManager.balanceOf(address(this));
  }
}
