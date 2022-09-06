// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import './ERC20Escrow.sol';
import './ERC721Escrow.sol';
import './EtherEscrow.sol';

contract GameEscrow is ERC20Escrow, ERC721Escrow, EtherEscrow {
  constructor(ERC20 _token, ERC721URIStorage _itemManager)
    ERC20Escrow(_token)
    ERC721Escrow(_itemManager)
  {}
}
