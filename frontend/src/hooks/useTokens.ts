import { Contract, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import addresses from '../contracts/adresses.json';
import factoryInfo from '../contracts/abis/ExchangeFactory.json';
import exchangeInfo from '../contracts/abis/Exchange.json';
import { ERC20, ExchangeFactory, Exchange } from '../../../typechain';
import { Token } from '../types/Token';

const factoryAddress = addresses.ExchangeFactory;
const factoryABI = factoryInfo.abi;
const exchangeABI = exchangeInfo.abi;

const loadTokens = async () => {
  const tokensInfo: { address: string; abi: ethers.ContractInterface }[] = [];
  for (const key in addresses) {
    if (key.endsWith('Token')) {
      const address = (addresses as Record<string, string>)[key];
      const tokenData = await import('../contracts/abis/' + key + '.json');
      const abi = tokenData.abi;
      tokensInfo.push({ address, abi });
    }
  }
  return tokensInfo;
};

export default (signer: ethers.Signer) => {
  const [tokens, setTokens] = useState<Map<string, Token>>(new Map());

  useEffect(() => {
    loadTokens()
      .then(async (tokensInfo) => {
        const factoryContract = new ethers.Contract(
          factoryAddress,
          factoryABI,
          signer
        ) as Contract & ExchangeFactory;
        const interval = setInterval(async () => {
          const newTokens: Map<string, Token> = new Map();
          for (const tokenInfo of tokensInfo) {
            const { address, abi } = tokenInfo;

            const contract = new ethers.Contract(
              address,
              abi,
              signer
            ) as Contract & ERC20;

            const name = await contract.name();
            const symbol = await contract.symbol();
            const signerBalance = (
              await contract.balanceOf(await signer.getAddress())
            ).toString();
            const exchangeAddress = await factoryContract.getExchange(address);
            const exchangeContract = new ethers.Contract(
              exchangeAddress,
              exchangeABI,
              signer
            ) as Contract & Exchange;

            let pricePer1Ether = ethers.BigNumber.from(0);
            let pricePer1Token = ethers.BigNumber.from(0);

            try {
              pricePer1Ether = await exchangeContract.getTokenAmount(
                '1000000000000000000'
              );

              pricePer1Token = await exchangeContract.getEthAmount(
                '1000000000000000000'
              );
            } catch (e) {
              console.error('There is not enough liquidity');
            }

            const newToken: Token = {
              name,
              symbol,
              address,
              contract,
              signerBalance,
              pricePer1Ether,
              pricePer1Token,
              exchangeContract,
            };
            newTokens.set(newToken.symbol, newToken);
          }
          setTokens(newTokens);
        }, 5000);
        return () => {
          clearInterval(interval);
        };
      })
      .catch((err) => {
        console.error(err);
      });
  }, [signer]);

  return tokens;
};
