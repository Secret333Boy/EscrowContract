// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Escrow {
  ERC20 token;
  mapping(address => uint256) private receiverGLDAddress;
  mapping(address => address[]) private rollbackGLDAddresses;
  mapping(address => mapping(address => bool)) private rollbackGLDPossible;
  mapping(address => mapping(address => uint256)) private rollbackGLDValue;

  event LogGLDSend(address indexed sender, address indexed to, uint256 value);

  event LogGLDWithDraw(address indexed to, uint256 value);

  event LogGLDRolledBack(
    address indexed sender,
    address indexed to,
    uint256 value
  );

  constructor(ERC20 _token) {
    token = _token;
  }

  function sendGLD(address payable to, uint256 amount) public {
    address from = msg.sender;
    uint256 value = amount;
    require(
      value <= token.balanceOf(msg.sender),
      "You don't have enough ERC20 tokens"
    );
    require(
      token.allowance(from, address(this)) >= value,
      "Check the token allowance"
    );
    token.transferFrom(from, address(this), amount);
    receiverGLDAddress[to] += value;
    if (!rollbackGLDPossible[to][from]) rollbackGLDValue[to][from] = 0;
    rollbackGLDValue[to][from] += value;
    rollbackGLDPossible[to][from] = true;
    rollbackGLDAddresses[to].push(from);
    emit LogGLDSend(from, to, value);
  }

  function withdrawGLD() public {
    address payable to = payable(msg.sender);
    uint256 _value = receiverGLDAddress[to];
    require(_value != 0, "You don't have ERC20 tokens sent to you");
    token.transfer(to, _value);
    delete receiverGLDAddress[to];
    for (uint256 i = 0; i < rollbackGLDAddresses[to].length; i++) {
      address from = rollbackGLDAddresses[to][i];
      rollbackGLDPossible[to][from] = false;
      delete rollbackGLDAddresses[to][i];
    }
    emit LogGLDWithDraw(msg.sender, _value);
  }

  function rollbackGLD(address payable to) public {
    address payable sender = payable(msg.sender);
    require(
      rollbackGLDPossible[to][sender],
      "Rollback is not available for you. ERC20 tokens might be already withdrawed"
    );
    uint256 _value = rollbackGLDValue[to][sender];
    require(_value != 0, "Rollback value is 0");
    token.transfer(msg.sender, _value);
    receiverGLDAddress[to] -= _value;
    delete rollbackGLDValue[to][sender];
    rollbackGLDPossible[to][sender] = false;
    for (uint256 i = 0; i < rollbackGLDAddresses[to].length; i++) {
      address from = rollbackGLDAddresses[to][i];
      if (from == sender) {
        delete rollbackGLDAddresses[to][i];
        break;
      }
    }
  }

  function getGLDBalance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }
}
