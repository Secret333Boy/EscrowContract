// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract EtherEscrow {
  struct Transaction {
    address from;
    address to;
    uint256 value;
  }

  mapping(address => Transaction[]) private receiverPendingTransactions;

  receive() external payable {}

  event Error(string);

  fallback() external payable {
    emit Error('call of a non-existent function');
  }

  event LogSend(address indexed sender, address indexed to, uint256 value);

  event LogWithDraw(address indexed to, uint256 value);

  event LogRolledBack(
    address indexed sender,
    address indexed to,
    uint256 value
  );

  function sendEther(address payable _to) external payable {
    address _from = msg.sender;
    uint256 _value = msg.value;
    Transaction memory transaction = Transaction({
      from: _from,
      to: _to,
      value: _value
    });
    receiverPendingTransactions[_to].push(transaction);
    emit LogSend(_from, _to, _value);
  }

  function withdrawEther() external {
    address payable to = payable(msg.sender);
    uint256 _value = 0;
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      _value += receiverPendingTransactions[to][i].value;
    }
    require(_value != 0, "You don't have ethers sent to you");
    (bool sent, ) = to.call{ value: _value }('');
    require(sent, 'Failed to send Ether');
    delete receiverPendingTransactions[to];
    emit LogWithDraw(msg.sender, _value);
  }

  function rollbackEther(address payable to) external {
    address payable sender = payable(msg.sender);
    uint256 _value = 0;
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        _value += receiverPendingTransactions[to][i].value;
      }
    }
    require(
      _value != 0,
      'Rollback is not available for you. Ethers might be already withdrawed'
    );
    (bool sent, ) = sender.call{ value: _value }('');
    require(sent, 'Failed to send Ether');
    for (uint256 i = 0; i < receiverPendingTransactions[to].length; i++) {
      if (receiverPendingTransactions[to][i].from == sender) {
        delete receiverPendingTransactions[to][i];
      }
    }
  }

  function getEtherBalance() public view returns (uint256) {
    return address(this).balance;
  }
}
