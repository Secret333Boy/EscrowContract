import { ethers } from 'ethers';
import React, { useContext, useState } from 'react';
import SignerContext from '../../contexts/signer.context';
import TokensContext from '../../contexts/tokens.context';
import { BalanceSpan } from '../BalanceSpan/BalanceSpan';
import LiquidityManagerStyled from './LiquidityManager.styled';

export const LiquidityManager = () => {
  const [chosenToken, setChosenToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ethAdd, setEthAdd] = useState('0');
  const [tokenAdd, setTokenAdd] = useState('0');
  const { signer, ethBalance } = useContext(SignerContext);
  const tokens = useContext(TokensContext);
  return (
    <LiquidityManagerStyled>
      <h3>Add liquidity</h3>
      <div>
        <input
          type="number"
          value={ethAdd}
          onChange={(e) => {
            setEthAdd(e.target.value);
          }}
        />
        <select name="" id="">
          <option value="ETH">ETH</option>
        </select>
      </div>
      <BalanceSpan balance={ethBalance || '0'} symbol="ETH" />
      <div>
        <input
          type="number"
          value={tokenAdd}
          onChange={(e) => {
            setTokenAdd(e.target.value);
          }}
        />
        <select
          name=""
          id=""
          defaultValue="..."
          onChange={(e) => {
            setChosenToken(e.target.value || '');
          }}
        >
          {!chosenToken && <option>...</option>}
          {Array.from(tokens.keys()).map((symbol) => (
            <option value={symbol} key={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>
      <BalanceSpan
        balance={tokens.get(chosenToken)?.signerBalance}
        symbol={tokens.get(chosenToken)?.symbol}
      />
      <button
        onClick={async (e) => {
          e.preventDefault();
          if (!chosenToken || !signer) return;
          const token = tokens.get(chosenToken);
          if (!token) return;
          const { contract, exchangeContract } = token;
          if (!contract || !exchangeContract) return;
          setIsSubmitting(true);
          try {
            const ethAmount = ethers.utils.parseEther(ethAdd);
            const tokenAmount = ethers.utils.parseEther(tokenAdd);
            await (
              await contract.approve(exchangeContract.address, tokenAmount)
            ).wait();
            (
              await exchangeContract.addLiquidity(tokenAmount, {
                value: ethAmount,
              })
            ).wait();
          } catch (e) {
            console.error(e);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={isSubmitting}
      >
        Add
      </button>
    </LiquidityManagerStyled>
  );
};
