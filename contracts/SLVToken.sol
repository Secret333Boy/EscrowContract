// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import './ERC20Token.sol';

contract SLVToken is ERC20Token {
  constructor(uint256 _initialSupply)
    ERC20Token('Silver', 'SLV', _initialSupply)
  {}
}
