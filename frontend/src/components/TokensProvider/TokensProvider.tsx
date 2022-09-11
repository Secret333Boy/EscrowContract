import React, { FC, ReactNode, useContext } from 'react';
import SignerContext from '../../contexts/signer.context';
import TokensContext from '../../contexts/tokens.context';
import useTokens from '../../hooks/useTokens';

export const TokensProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { signer } = useContext(SignerContext);
  if (!signer)
    return (
      <div>You should connect your wallet before accessing this component</div>
    );
  const tokens = useTokens(signer);
  if (tokens.size === 0) return <div>Loading tokens...</div>;
  return (
    <TokensContext.Provider value={tokens}>{children}</TokensContext.Provider>
  );
};
