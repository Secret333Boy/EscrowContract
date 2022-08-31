// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;
import "./GLDToken.sol";

contract GLDExchange {
  GLDToken token;

  event Bought(uint256 indexed amount);
  event Sold(uint256 indexed amount);

  constructor(GLDToken _token) {
    token = _token;
    if (address(token) == address(0)) token = new GLDToken(1000);
  }

  uint8 constant BUY_COST = 10;
  uint8 constant SELL_COST = 10;

  function buy() public payable returns (uint256) {
    uint256 amountToBuy = msg.value / BUY_COST;
    uint256 restAmount = msg.value - (amountToBuy * BUY_COST);
    if (restAmount > 0) payable(msg.sender).transfer(restAmount);
    uint256 dexBalance = token.balanceOf(address(this));
    require(amountToBuy > 0, "You need to send some ether");
    require(amountToBuy <= dexBalance, "Not enough tokens in the reserve");
    token.transfer(msg.sender, amountToBuy);
    emit Bought(amountToBuy);
    return amountToBuy;
  }

  function sell(uint256 amount) public {
    require(amount > 0, "You need to sell at least some tokens");
    uint256 allowance = token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Check the token allowance");
    token.transferFrom(msg.sender, address(this), amount);
    (bool sent, ) = payable(msg.sender).call{value: amount * SELL_COST}("");
    require(sent, "Failed to send Ether");
    emit Sold(amount);
  }

  function balance() public view returns (uint256) {
    return token.balanceOf(msg.sender);
  }
}
