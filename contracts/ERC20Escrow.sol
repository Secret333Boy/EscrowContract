// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ERC20Escrow {
  ERC20 token;
  struct ERC20Transaction {
    address from;
    address to;
    uint256 value;
  }

  mapping(address => ERC20Transaction[]) private receiverPendingTransactions;

  event LogERC20Send(address indexed sender, address indexed to, uint256 value);

  event LogERC20WithDraw(address indexed to, uint256 value);

  event LogERC20RolledBack(
    address indexed sender,
    address indexed to,
    uint256 value
  );

  constructor(ERC20 _token) {
    token = _token;
  }

  function sendERC20(address payable _to, uint256 _value) public {
    address _from = msg.sender;
    require(
      _value <= token.balanceOf(msg.sender),
      "You don't have enough ERC20 tokens"
    );
    require(
      token.allowance(_from, address(this)) >= _value,
      'Check the token allowance'
    );
    token.transferFrom(_from, address(this), _value);
    ERC20Transaction memory transaction = ERC20Transaction({
      from: _from,
      to: _to,
      value: _value
    });
    receiverPendingTransactions[_to].push(transaction);
    emit LogERC20Send(_from, _to, _value);
  }

  function withdrawERC20() public {
    address payable to = payable(msg.sender);
    uint256 _value = 0;
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      _value += receiverPendingTransactions[to][i].value;
    }
    require(_value != 0, "You don't have ERC20 tokens sent to you");
    token.transfer(to, _value);
    delete receiverPendingTransactions[to];
    emit LogERC20WithDraw(msg.sender, _value);
  }

  function rollbackERC20(address payable to) public {
    address payable sender = payable(msg.sender);
    uint256 _value = 0;
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        _value += receiverPendingTransactions[to][i].value;
      }
    }
    require(
      _value != 0,
      'Rollback is not available for you. ERC20 tokens might be already withdrawed'
    );
    token.transfer(msg.sender, _value);
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        delete receiverPendingTransactions[to][i];
      }
    }
    emit LogERC20RolledBack(sender, to, _value);
  }

  function getERC20Balance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }
}
