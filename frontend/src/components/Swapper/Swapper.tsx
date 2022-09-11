import React, { useContext, useState } from 'react';
import SignerContext from '../../contexts/signer.context';
import TokensContext from '../../contexts/tokens.context';
import { BalanceSpan } from '../BalanceSpan/BalanceSpan';
import SwapperStyled from './Swapper.styled';

export const Swapper = () => {
  const [swapTokensState, setSwapTokensState] = useState<{
    a: string;
    b: string | null;
  }>({ a: 'ETH', b: null });
  const [swapTokensAmount, setSwapTokensAmount] = useState<{
    a: string;
    b: string;
  }>({ a: '0', b: '0' });
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
          value={swapTokensAmount.a}
          onChange={(e) => {
            setSwapTokensAmount({ ...swapTokensAmount, a: e.target.value });
          }}
        />
        <select
          name="token1"
          id="token1"
          onChange={(e) => {
            setSwapTokensState({ ...swapTokensState, a: e.target.value });
          }}
          value={swapTokensState.a}
        >
          {tokenSymbols.map(
            (symbol, i) =>
              symbol !== swapTokensState.b && <option key={i}>{symbol}</option>
          )}
        </select>
      </div>
      <BalanceSpan
        balance={
          (swapTokensState.a === 'ETH'
            ? ethBalance
            : tokens.get(swapTokensState.a)?.signerBalance) || '0'
        }
        symbol={swapTokensState.a}
      />
      <div>
        <input
          type="number"
          value={swapTokensAmount.b}
          onChange={(e) => {
            setSwapTokensAmount({ ...swapTokensAmount, b: e.target.value });
          }}
        />
        <select
          name="token2"
          id="token2"
          onChange={(e) => {
            setSwapTokensState({ ...swapTokensState, b: e.target.value });
          }}
          value={swapTokensState.b || '...'}
        >
          {!swapTokensState.b && <option>...</option>}
          {tokenSymbols.map(
            (symbol, i) =>
              symbol !== swapTokensState.a && <option key={i}>{symbol}</option>
          )}
        </select>
      </div>
      <BalanceSpan
        balance={
          (swapTokensState.b === 'ETH'
            ? ethBalance
            : tokens.get(swapTokensState.b || '')?.signerBalance) || '0'
        }
        symbol={swapTokensState.b || ''}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!swapTokensState.b) return;
          setIsSwapping(true);
          setIsSwapping(false);
        }}
        disabled={isSwapping}
      >
        Swap
      </button>
      <div>
        1 {swapTokensState.a} ≈{' '}
        {tokens.get(swapTokensState.b || '')?.pricePer1Ether}{' '}
        {swapTokensState.b}
      </div>
    </SwapperStyled>
  );
};
