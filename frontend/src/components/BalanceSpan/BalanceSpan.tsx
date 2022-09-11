import { ethers } from 'ethers';
import React, { FC } from 'react';

interface BalanceSpanProps {
  symbol?: string;
  balance?: ethers.BigNumberish;
}

export const BalanceSpan: FC<BalanceSpanProps> = ({ symbol, balance }) => {
  return (
    <span>
      Your {symbol || ''} balance: {ethers.utils.formatEther(balance || '0')}
    </span>
  );
};
