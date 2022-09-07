// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './IFactory.sol';

contract Exchange is ERC20 {
  ERC20 public token;
  address public factoryAddress;

  constructor(ERC20 _token, address _factoryAddress) ERC20('Muniswap', 'MUNI') {
    token = _token;
    factoryAddress = _factoryAddress;
  }

  function addLiquidity(uint256 _tokenAmount) public payable returns (uint256) {
    if (getReserve() == 0) {
      token.transferFrom(msg.sender, address(this), _tokenAmount);

      uint256 liquidity = address(this).balance;
      _mint(msg.sender, liquidity);
      return liquidity;
    } else {
      uint256 ethReserve = address(this).balance - msg.value;
      uint256 tokenReserve = getReserve();
      uint256 tokenAmount = (msg.value * tokenReserve) / ethReserve;
      require(_tokenAmount >= tokenAmount, 'insufficient token amount');
      token.transferFrom(msg.sender, address(this), tokenAmount);

      uint256 liquidity = (totalSupply() * msg.value) / ethReserve;
      _mint(msg.sender, liquidity);
      return liquidity;
    }
  }

  function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
    require(_amount > 0, 'Invalid amount');
    uint256 ethAmount = (address(this).balance * _amount) / totalSupply();
    uint256 tokenAmount = (getReserve() * _amount) / totalSupply();
    _burn(msg.sender, _amount);
    payable(msg.sender).transfer(ethAmount);
    token.transfer(msg.sender, tokenAmount);
    return (ethAmount, tokenAmount);
  }

  function getAmount(
    uint256 inputAmount,
    uint256 inputReserve,
    uint256 outputReserve
  ) private pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, 'Invalid reserves');
    uint256 inputAmountWithFee = inputAmount * (100 - 1);
    uint256 numerator = inputAmountWithFee * outputReserve;
    uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
    return numerator / denominator;
  }

  function ethToToken(uint256 _minTokens, address recipient) private {
    uint256 tokenReserve = getReserve();
    uint256 tokensBought = getAmount(
      msg.value,
      address(this).balance - msg.value,
      tokenReserve
    );
    require(tokensBought >= _minTokens, 'Insufficiant ether');
    token.transfer(recipient, tokensBought);
  }

  function ethToTokenSwap(uint256 _minTokens) public payable {
    ethToToken(_minTokens, msg.sender);
  }

  function ethToTokenTransfer(uint256 _minTokens, address _recipient)
    public
    payable
  {
    ethToToken(_minTokens, _recipient);
  }

  function tokenToEthSwap(uint256 _tokensSold, uint256 _minEth) public {
    uint256 tokenReserve = getReserve();
    uint256 ethBought = getAmount(
      _tokensSold,
      tokenReserve,
      address(this).balance
    );
    require(ethBought >= _minEth, 'Inssuficiant tokens');
    token.transferFrom(msg.sender, address(this), _tokensSold);
    payable(msg.sender).transfer(ethBought);
  }

  function tokenToTokenSwap(
    uint256 _tokensSold,
    uint256 _minTokensBought,
    address _tokenAddress
  ) public {
    address exchangeAddress = IFactory(factoryAddress).getExchange(
      _tokenAddress
    );
    require(
      exchangeAddress != address(this) && exchangeAddress != address(0),
      "This exchange does't exist"
    );
    uint256 tokenReserve = getReserve();
    uint256 ethBought = getAmount(
      _tokensSold,
      tokenReserve,
      address(this).balance
    );
    token.transferFrom(msg.sender, address(this), _tokensSold);
    Exchange(exchangeAddress).ethToTokenTransfer{ value: ethBought }(
      _minTokensBought,
      msg.sender
    );
  }

  function getTokenAmount(uint256 _ethSold) public view returns (uint256) {
    require(_ethSold > 0, 'ethSold is too small');
    return getAmount(_ethSold, address(this).balance, getReserve());
  }

  function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
    require(_tokenSold > 0, 'tokenSold is too small');
    return getAmount(_tokenSold, getReserve(), address(this).balance);
  }

  function getReserve() public view returns (uint256) {
    return token.balanceOf(address(this));
  }
}
