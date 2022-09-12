import { ethers } from 'ethers';
import { ERC20, Exchange } from '../../../typechain';

export interface Token {
  name: string;
  symbol: string;
  address: string;
  contract: ethers.Contract & ERC20;
  signerBalance: string;
  pricePer1Ether: ethers.BigNumber;
  pricePer1Token: ethers.BigNumber;
  exchangeContract: ethers.Contract & Exchange;
}
