// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./GLDEscrow.sol";
import "./GameItemEscrow.sol";

contract GameEscrow is GLDEscrow, GameItemEscrow {
    constructor(GLDToken _token, GameItemManager _itemManager) GLDEscrow(_token) GameItemEscrow(_itemManager) {}
}