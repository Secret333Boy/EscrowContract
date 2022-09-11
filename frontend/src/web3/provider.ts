/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
const provider = new ethers.providers.Web3Provider(
  (window as any).ethereum,
  process.env.REACT_APP_NETWORK
);

provider.on('network', (_newNetwork, oldNetwork) => {
  if (oldNetwork) {
    window.location.reload();
  }
});
export default provider;
