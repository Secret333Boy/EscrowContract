import { ethers } from 'ethers';
import { ERC20, Exchange } from '../../../typechain';

export interface Token {
  name: string;
  symbol: string;
  address: string;
  contract: ethers.Contract & ERC20;
  signerBalance: string;
  pricePer1Ether: string;
  pricePer1Token: string;
  exchangeContract: ethers.Contract & Exchange;
}
