// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import './Exchange.sol';

contract ExchangeFactory is Ownable {
  mapping(address => address) tokenToExchange;

  event ExchangeCreated(address _address);

  function createExchange(address _token) public onlyOwner returns (address) {
    require(tokenToExchange[_token] == address(0), 'Exchange already exists');
    Exchange exchange = new Exchange(ERC20(_token), address(this));
    tokenToExchange[_token] = address(exchange);
    emit ExchangeCreated(address(exchange));
    return address(exchange);
  }

  function getExchange(address _token) public view returns (address) {
    return tokenToExchange[_token];
  }
}
