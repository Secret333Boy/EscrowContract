import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import provider from '../web3/provider';

const setupSigner = async () => {
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};

export default () => {
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  useEffect(() => {
    setupSigner().then((signer) => {
      setSigner(signer);
    });
  }, []);
  return { signer, setSigner };
};
