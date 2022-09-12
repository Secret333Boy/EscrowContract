import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import SignerContext from '../../contexts/signer.context';
import TokensContext from '../../contexts/tokens.context';
import { BalanceSpan } from '../BalanceSpan/BalanceSpan';
import SwapperStyled from './Swapper.styled';

export const Swapper = () => {
  const [tokenA, setTokenA] = useState<string>('ETH');
  const [tokenB, setTokenB] = useState<string>();
  const [amountA, setAmountA] = useState<string>('0');
  const [amountB, setAmountB] = useState<string>('0');
  const [course, setCourse] = useState('');

  useEffect(() => {
    const tokenAInfo = tokens.get(tokenA || '');
    const tokenBInfo = tokens.get(tokenB || '');
    if (tokenA === 'ETH') {
      setCourse(ethers.utils.formatEther(tokenBInfo?.pricePer1Token || '0'));
      return;
    }
    if (tokenB === 'ETH') {
      setCourse(ethers.utils.formatEther(tokenAInfo?.pricePer1Token || '0'));
      return;
    }
    if (!tokenAInfo || !tokenBInfo) {
      setCourse('');
      return;
    }

    const priceA = ethers.utils.formatEther(tokenAInfo.pricePer1Token);
    const priceB = ethers.utils.formatEther(tokenBInfo.pricePer1Token);
    setCourse((+priceA / +priceB).toString());
  }, [tokenA, tokenB]);

  const evaluateB = async () => {
    const exchangeContractA = tokens.get(tokenA)?.exchangeContract;
    const exchangeContractB = tokens.get(tokenB || '')?.exchangeContract;

    if (tokenA === 'ETH') {
      const ethToSell = ethers.utils.parseEther(amountA);
      const tokenAmount = await exchangeContractB?.getTokenAmount(ethToSell);
      const amountToBuy = ethers.utils.formatEther(tokenAmount || '0');
      setAmountB(amountToBuy);
    } else if (tokenB === 'ETH') {
      const tokenToSell = ethers.utils.parseEther(amountA);
      const ethAmount = await exchangeContractA?.getEthAmount(tokenToSell);
      const amountToBuy = ethers.utils.formatEther(ethAmount || '0');
      setAmountB(amountToBuy);
    } else {
      const tokenToSell = ethers.utils.parseEther(amountA);
      const ethFromA =
        (await exchangeContractA?.getEthAmount(tokenToSell)) ||
        ethers.BigNumber.from(0);
      const tokenToBuy = await exchangeContractB?.getTokenAmount(ethFromA);
      const amountToBuy = ethers.utils.formatEther(tokenToBuy || 0);
      setAmountB(amountToBuy);
    }
  };

  useEffect(() => {
    evaluateB().catch((err) => console.error(err));
  }, [tokenA, tokenB, amountA]);

  const [isSwapping, setIsSwapping] = useState(false);
  const { ethBalance } = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  const tokenSymbols = ['ETH'].concat(Array.from(tokens.keys()));

  return (
    <SwapperStyled>
      <h3>Swap</h3>
      <div>
        <input
          type="number"
          value={amountA}
          onChange={(e) => {
            setAmountA(e.target.value);
          }}
        />
        <select
          name="token1"
          id="token1"
          onChange={(e) => {
            setTokenA(e.target.value);
          }}
          value={tokenA}
        >
          {tokenSymbols.map(
            (symbol, i) =>
              symbol !== tokenB && <option key={i}>{symbol}</option>
          )}
        </select>
      </div>
      <BalanceSpan
        balance={
          (tokenA === 'ETH' ? ethBalance : tokens.get(tokenA)?.signerBalance) ||
          '0'
        }
        symbol={tokenA}
      />
      <div>
        <input
          type="number"
          value={amountB}
          onChange={(e) => {
            setAmountB(e.target.value);
          }}
          disabled={true}
        />
        <select
          name="token2"
          id="token2"
          onChange={(e) => {
            setTokenB(e.target.value);
          }}
          value={tokenB || '...'}
        >
          {!tokenB && <option>...</option>}
          {tokenSymbols.map(
            (symbol, i) =>
              symbol !== tokenA && <option key={i}>{symbol}</option>
          )}
        </select>
      </div>
      <BalanceSpan
        balance={
          (tokenB === 'ETH'
            ? ethBalance
            : tokens.get(tokenB || '')?.signerBalance) || '0'
        }
        symbol={tokenB || ''}
      />
      <button
        onClick={async (e) => {
          e.preventDefault();
          if (!tokenB) return;
          setIsSwapping(true);
          try {
            if (tokenA === 'ETH') {
              const exchangeContractB = tokens.get(tokenB)?.exchangeContract;
              if (!exchangeContractB) throw 'ContractB is undefined';
              const minAmount = ethers.utils
                .parseEther(amountB)
                .mul(999)
                .div(1000);
              await (
                await exchangeContractB.ethToTokenSwap(minAmount, {
                  value: ethers.utils.parseEther(amountA),
                })
              ).wait();
            } else if (tokenB === 'ETH') {
              const token = tokens.get(tokenA);
              if (!token) throw 'Token A is undefined';
              const { exchangeContract, contract } = token;
              const minEth = ethers.utils
                .parseEther(amountB)
                .mul(999)
                .div(1000);
              await (
                await contract.approve(
                  exchangeContract.address,
                  ethers.utils.parseEther(amountA)
                )
              ).wait();
              await (
                await exchangeContract.tokenToEthSwap(
                  ethers.utils.parseEther(amountA),
                  minEth
                )
              ).wait();
            } else {
              const tokenInfoA = tokens.get(tokenA);
              if (!tokenInfoA) throw 'Token A info is undefined';
              const tokenInfoB = tokens.get(tokenB);
              if (!tokenInfoB) throw 'Token B info is undefined';
              const { exchangeContract, contract } = tokenInfoA;
              const minTokens = ethers.utils
                .parseEther(amountB)
                .mul(999)
                .div(1000);
              await (
                await contract.approve(
                  exchangeContract.address,
                  ethers.utils.parseEther(amountA)
                )
              ).wait();
              await (
                await exchangeContract.tokenToTokenSwap(
                  ethers.utils.parseEther(amountA),
                  minTokens,
                  tokenInfoB.address
                )
              ).wait();
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsSwapping(false);
          }
        }}
        disabled={isSwapping || !tokenB}
      >
        Swap
      </button>
      <div>
        1 {tokenA} ≈ {course} {tokenB}
      </div>
    </SwapperStyled>
  );
};
