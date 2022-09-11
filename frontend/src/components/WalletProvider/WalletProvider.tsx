import React, { FC, ReactNode } from 'react';
import SignerContext from '../../contexts/signer.context';
import useBalance from '../../hooks/useBalance';
import useSigner from '../../hooks/useSigner';

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { signer, setSigner } = useSigner();
  const ethBalance = useBalance(signer);
  if (!signer) return <div>Connecting your metamask wallet</div>;
  return (
    <>
      <SignerContext.Provider value={{ signer, setSigner, ethBalance }}>
        {children}
      </SignerContext.Provider>
    </>
  );
};
