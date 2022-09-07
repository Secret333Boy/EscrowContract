// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import './Exchange.sol';

contract ExchangeFactory is Ownable {
  mapping(ERC20 => address) public tokenToExchange;

  function createExchange(ERC20 _token) public onlyOwner returns (address) {
    require(tokenToExchange[_token] == address(0), 'Exchange already exists');
    Exchange exchange = new Exchange(_token, address(this));
    tokenToExchange[_token] = address(exchange);
    return address(exchange);
  }

  function getExchange(ERC20 _token) public view returns (address) {
    return tokenToExchange[_token];
  }
}
