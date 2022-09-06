// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DutchAuction {
  uint256 private constant DURATION = 7 days;

  ERC721 public immutable nft;
  uint256 public immutable nftId;

  address payable public immutable seller;
  uint256 public immutable startingPrice;
  uint256 public immutable startAt;
  uint256 public immutable expiresAt;
  uint256 public immutable discountRate;

  constructor(
    uint256 _startingPrice,
    uint256 _discountRate,
    ERC721 _nft,
    uint256 _nftId,
    uint256 _duration
  ) {
    if (_duration == 0) {
      _duration = DURATION;
    }
    seller = payable(msg.sender);
    startingPrice = _startingPrice;
    startAt = block.timestamp;
    expiresAt = block.timestamp + _duration;
    discountRate = _discountRate;

    require(_startingPrice >= _discountRate * DURATION, "Starting price < min");

    nft = _nft;
    nftId = _nftId;
  }

  function getPrice() public view returns (uint256) {
    uint256 timeElapsed = block.timestamp - startAt;
    uint256 discount = discountRate * timeElapsed;
    return startingPrice - discount;
  }

  function buy() external payable {
    require(block.timestamp < expiresAt, "Auction expired");

    uint256 price = getPrice();
    require(msg.value >= price, "ETH < price");

    nft.transferFrom(seller, msg.sender, nftId);
    uint256 refund = msg.value - price;
    if (refund > 0) {
      payable(msg.sender).transfer(refund);
    }
    selfdestruct(seller);
  }
}
