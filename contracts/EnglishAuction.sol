// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract EnglishAuction {
  event Start();
  event Bid(address indexed sender, uint256 amount);
  event Withdraw(address indexed bidder, uint256 amount);
  event End(address winner, uint256 amount);

  ERC721 public nft;
  uint256 public nftId;

  address payable public seller;
  uint256 public endAt;
  bool public started;
  bool public ended;
  uint256 duration;

  address public highestBidder;
  uint256 public highestBid;
  mapping(address => uint256) public bids;

  constructor(
    ERC721 _nft,
    uint256 _startingBid,
    uint256 _duration
  ) {
    nft = _nft;

    duration = _duration;

    seller = payable(msg.sender);
    highestBid = _startingBid;
  }

  function start(uint256 _nftId) external {
    require(!started, 'Started');
    require(msg.sender == seller, 'You are not the seller');

    nftId = _nftId;
    nft.transferFrom(msg.sender, address(this), nftId);
    started = true;
    endAt = block.timestamp + duration;

    emit Start();
  }

  function bid() external payable {
    require(started, 'not started');
    require(block.timestamp < endAt, 'Already ended');
    require(msg.value + bids[msg.sender] > highestBid, 'value < highest');
    highestBidder = msg.sender;

    if (highestBidder != address(0)) {
      bids[highestBidder] += highestBid;
    }

    highestBid = bids[highestBidder];

    emit Bid(msg.sender, bids[highestBidder]);
  }

  function withdraw() external {
    uint256 bal = bids[msg.sender];
    bids[msg.sender] = 0;
    payable(msg.sender).transfer(bal);

    emit Withdraw(msg.sender, bal);
  }

  function end() external {
    require(started, 'not started');
    require(block.timestamp >= endAt, 'not ended');
    require(!ended, 'ended');

    ended = true;
    if (highestBidder != address(0)) {
      nft.safeTransferFrom(address(this), highestBidder, nftId);
      seller.transfer(highestBid);
    } else {
      nft.safeTransferFrom(address(this), seller, nftId);
    }

    emit End(highestBidder, highestBid);
  }

  function timeLeft() external view returns (uint256) {
    if (block.timestamp >= endAt) {
      return 0;
    } else {
      return endAt - block.timestamp;
    }
  }
}
