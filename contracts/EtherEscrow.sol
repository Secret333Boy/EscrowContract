// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract EtherEscrow {
  mapping(address => uint256) private receiverAddress;
  mapping(address => address[]) private rollbackAddresses;
  mapping(address => mapping(address => bool)) private rollbackPossible;
  mapping(address => mapping(address => uint256)) private rollbackValue;

  receive() external payable {}

  event Error(string);

  fallback() external payable {
    emit Error("call of a non-existent function");
  }

  event LogSend(address indexed sender, address indexed to, uint256 value);

  event LogWithDraw(address indexed to, uint256 value);

  event LogRolledBack(
    address indexed sender,
    address indexed to,
    uint256 value
  );

  function sendEther(address payable to) external payable {
    address from = msg.sender;
    uint256 value = msg.value;
    receiverAddress[to] += value;
    if (!rollbackPossible[to][from]) rollbackValue[to][from] = 0;
    rollbackValue[to][from] += value;
    rollbackPossible[to][from] = true;
    rollbackAddresses[to].push(from);
    emit LogSend(from, to, value);
  }

  function withdrawEther() external {
    address payable to = payable(msg.sender);
    uint256 _value = receiverAddress[to];
    require(_value != 0, "You don't have ethers sent to you");
    (bool sent, ) = to.call{value: _value}("");
    require(sent, "Failed to send Ether");
    delete receiverAddress[to];
    for (uint256 i = 0; i < rollbackAddresses[to].length; i++) {
      address from = rollbackAddresses[to][i];
      rollbackPossible[to][from] = false;
      delete rollbackAddresses[to][i];
    }
    emit LogWithDraw(msg.sender, _value);
  }

  function rollbackEther(address payable to) external {
    address payable sender = payable(msg.sender);
    require(
      rollbackPossible[to][sender],
      "Rollback is not available for you. Ethers might be already withdrawed"
    );
    uint256 _value = rollbackValue[to][sender];
    require(_value != 0, "Rollback value is 0");
    (bool sent, ) = sender.call{value: _value}("");
    require(sent, "Failed to send Ether");
    receiverAddress[to] -= _value;
    delete rollbackValue[to][sender];
    rollbackPossible[to][sender] = false;
    for (uint256 i = 0; i < rollbackAddresses[to].length; i++) {
      address from = rollbackAddresses[to][i];
      if (from == sender) {
        delete rollbackAddresses[to][i];
        break;
      }
    }
  }

  function getEtherBalance() public view returns (uint256) {
    return address(this).balance;
  }
}
