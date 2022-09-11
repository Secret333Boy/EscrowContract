import { Signer } from 'ethers';
import { useEffect, useState } from 'react';

export default (signer?: Signer) => {
  const [balance, setBalance] = useState('');
  useEffect(() => {
    const interval = setInterval(async () => {
      if (signer) {
        setBalance((await signer.getBalance()).toString());
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [signer]);
  return balance;
};
